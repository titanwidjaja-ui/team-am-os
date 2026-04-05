'use strict';

// ============================================================
// TEAM AM — TIER-AWARE TEXT CLEANUP LAYER
//
// Permanent post-generation pipeline stage. Runs after Stage 2
// blueprint generation and before verify-numbers.js / Stage 3 QA.
//
// Enforces deterministic text rules: banned punctuation, banned
// phrases, and tier-conditional vocabulary restrictions.
//
// NOTE: This handles deterministic enforcement only. A future
// Stage 2.5 Voice Pass will add LLM-based voice refinement.
//
// USAGE (module):
//   const { cleanupText } = require('./cleanup-text');
//   const report = cleanupText(text, 'standard');
//   // report.text    — cleaned text
//   // report.status  — 'CLEAN' or 'MODIFIED'
//   // report.changes — array of { type, original, replacement, count }
//
// USAGE (CLI):
//   node Engine/cleanup-text.js input.md output.md --tier standard
// ============================================================

const fs   = require('fs');
const path = require('path');

// ============================================================
// ALWAYS ENFORCED (all tiers)
// ============================================================

const AI_PHRASE_REPLACEMENTS = [
  { pattern: /It is recommended that\s*/gi,   replacement: '' },
  { pattern: /One should consider\s*/gi,      replacement: 'Consider ' },
  { pattern: /It'?s important to note\s*/gi,  replacement: '' },
  { pattern: /In conclusion,?\s*/gi,          replacement: '' },
  { pattern: /Moving forward,?\s*/gi,         replacement: '' },
  { pattern: /Let'?s dive into\s*/gi,         replacement: "Here's " },
  { pattern: /In this regard,?\s*/gi,         replacement: '' },
  { pattern: /It should be noted\s*/gi,       replacement: '' }
];

const WORD_REPLACEMENTS_ALL = [
  { pattern: /\bjourney\b/gi,   replacement: 'process' },
  { pattern: /\bsynergy\b/gi,   replacement: '' },
  { pattern: /\bsynergies\b/gi, replacement: '' },
  { pattern: /\bembark\b/gi,    replacement: 'start' },
  { pattern: /\bdelve\b/gi,     replacement: 'look at' },
  { pattern: /\bempower\b/gi,   replacement: 'help' },
  { pattern: /\bempowers\b/gi,  replacement: 'helps' },
  { pattern: /\bholistic\b/gi,  replacement: 'complete' }
];

// ============================================================
// ESSENTIAL + STANDARD TIER BANS (Expert tier: allowed)
// ============================================================

const WORD_REPLACEMENTS_NON_EXPERT = [
  { pattern: /\bgame-changer\b/gi,    replacement: 'difference-maker' },
  { pattern: /\bgame changer\b/gi,    replacement: 'difference-maker' },
  { pattern: /\bunlock\b/gi,          replacement: 'build' },
  { pattern: /\bunlocks\b/gi,         replacement: 'builds' },
  { pattern: /\bunlocking\b/gi,       replacement: 'building' },
  { pattern: /\bleverage\b/gi,        replacement: 'use' },
  { pattern: /\bleveraging\b/gi,      replacement: 'using' },
  { pattern: /\boptimal\b/gi,         replacement: 'best' },
  { pattern: /\bcomprehensive\b/gi,   replacement: 'complete' }
];

// ============================================================
// CORE: cleanupText(text, tier) → report
// ============================================================

function cleanupText(text, tier) {
  tier = (tier || 'standard').toLowerCase();
  if (!['essential', 'standard', 'expert'].includes(tier)) {
    throw new Error(`Invalid tier: "${tier}". Must be essential, standard, or expert.`);
  }

  const changes = [];
  let cleaned = text;

  // ---- PASS 1: Em dash replacement (contextual) ---------------
  const emDashResult = _replaceEmDashes(cleaned);
  cleaned = emDashResult.text;
  if (emDashResult.count > 0) {
    changes.push({
      type:        'em_dash',
      original:    '—',
      replacement: '(contextual: comma, period, or colon)',
      count:       emDashResult.count
    });
  }

  // ---- PASS 2: Double dash replacement -------------------------
  const dblDashResult = _replaceDoubleDashes(cleaned);
  cleaned = dblDashResult.text;
  if (dblDashResult.count > 0) {
    changes.push({
      type:        'double_dash',
      original:    '--',
      replacement: '(contextual)',
      count:       dblDashResult.count
    });
  }

  // ---- PASS 3: AI phrase removal (all tiers) -------------------
  for (const rule of AI_PHRASE_REPLACEMENTS) {
    const before = cleaned;
    cleaned = cleaned.replace(rule.pattern, rule.replacement);
    const count = _countDiff(before, cleaned, rule.pattern);
    if (count > 0) {
      changes.push({
        type:        'ai_phrase',
        original:    rule.pattern.source.replace(/\\s\*/g, '').replace(/,\?/g, ''),
        replacement: rule.replacement || '(removed)',
        count
      });
    }
  }

  // ---- PASS 4: Word replacements (all tiers) -------------------
  for (const rule of WORD_REPLACEMENTS_ALL) {
    const before = cleaned;
    cleaned = cleaned.replace(rule.pattern, rule.replacement);
    const count = _countDiff(before, cleaned, rule.pattern);
    if (count > 0) {
      changes.push({
        type:        'banned_word',
        original:    rule.pattern.source.replace(/\\b/g, ''),
        replacement: rule.replacement || '(removed)',
        count
      });
    }
  }

  // ---- PASS 5: Tier-conditional replacements -------------------
  if (tier !== 'expert') {
    for (const rule of WORD_REPLACEMENTS_NON_EXPERT) {
      const before = cleaned;
      cleaned = cleaned.replace(rule.pattern, rule.replacement);
      const count = _countDiff(before, cleaned, rule.pattern);
      if (count > 0) {
        changes.push({
          type:        'tier_ban',
          original:    rule.pattern.source.replace(/\\b/g, ''),
          replacement: rule.replacement,
          count,
          tier_note:   `Banned at ${tier} tier (allowed at expert)`
        });
      }
    }
  }

  // ---- PASS 6: Cleanup artifacts from replacements -------------
  cleaned = cleaned.replace(/\.\s*\./g, '.');
  cleaned = cleaned.replace(/,\s*,/g, ',');
  cleaned = cleaned.replace(/:\s*,/g, ':');
  cleaned = cleaned.replace(/,\s*\./g, '.');
  cleaned = cleaned.replace(/[^\S\n\r]{2,}/g, ' ');
  // Fix sentences starting lowercase after period replacement
  cleaned = cleaned.replace(/\. ([a-z])/g, (_, c) => '. ' + c.toUpperCase());

  const totalChanges = changes.reduce((sum, c) => sum + c.count, 0);

  return {
    status:  totalChanges === 0 ? 'CLEAN' : 'MODIFIED',
    tier,
    total_changes: totalChanges,
    changes,
    text:    cleaned
  };
}

// ============================================================
// EM DASH REPLACEMENT (contextual, line-based)
// ============================================================

function _replaceEmDashes(text) {
  const lines = text.split('\n');
  const result = [];
  let totalCount = 0;

  for (const line of lines) {
    const dashCount = (line.match(/\u2014/g) || []).length;
    if (dashCount === 0) { result.push(line); continue; }

    totalCount += dashCount;
    let fixed = line;

    if (dashCount >= 2 && dashCount % 2 === 0) {
      // Paired parentheticals: replace with commas
      fixed = fixed.replace(/\s*\u2014\s*/g, ', ');
    } else if (dashCount === 1) {
      const dashPos = fixed.indexOf('\u2014');
      const before  = fixed.substring(0, dashPos).trim();
      const after   = fixed.substring(dashPos + 1).trim();

      if (/^(here|this|that|the|your|we|it|these|those|specifically|exactly|just)\b/i.test(after)
          && /[a-z]$/i.test(before)) {
        fixed = fixed.replace(/\s*\u2014\s*/, ': ');
      } else if (/[a-z]$/i.test(before) && /^[A-Z]/.test(after)) {
        fixed = fixed.replace(/\s*\u2014\s*/, '. ');
      } else {
        fixed = fixed.replace(/\s*\u2014\s*/, ', ');
      }
    } else {
      // Odd > 1: replace all with commas except last with period
      let count = 0;
      fixed = fixed.replace(/\s*\u2014\s*/g, () => {
        count++;
        return count < dashCount ? ', ' : '. ';
      });
    }

    result.push(fixed);
  }

  return { text: result.join('\n'), count: totalCount };
}

// ============================================================
// DOUBLE DASH REPLACEMENT (preserve markdown horizontal rules)
// ============================================================

function _replaceDoubleDashes(text) {
  const lines = text.split('\n');
  const result = [];
  let totalCount = 0;

  for (const line of lines) {
    // Preserve markdown horizontal rules (--- or more on own line)
    if (/^-{3,}\s*$/.test(line.trim())) {
      result.push(line);
      continue;
    }

    const matches = line.match(/--/g);
    if (!matches) { result.push(line); continue; }

    totalCount += matches.length;
    result.push(line.replace(/\s*--\s*/g, ', '));
  }

  return { text: result.join('\n'), count: totalCount };
}

// ============================================================
// HELPERS
// ============================================================

function _countDiff(before, after, pattern) {
  const matchesBefore = before.match(pattern);
  return matchesBefore ? matchesBefore.length : 0;
}

// ============================================================
// CLI ENTRY POINT
// ============================================================

/* istanbul ignore next */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node cleanup-text.js <input.md> <output.md> [--tier essential|standard|expert]');
    process.exit(1);
  }

  const inputPath  = path.resolve(args[0]);
  const outputPath = path.resolve(args[1]);

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: input file not found: ${inputPath}`);
    process.exit(1);
  }

  let tier = 'standard';
  const tierIdx = args.indexOf('--tier');
  if (tierIdx !== -1 && args[tierIdx + 1]) {
    tier = args[tierIdx + 1];
  }

  const text   = fs.readFileSync(inputPath, 'utf8');
  const report = cleanupText(text, tier);

  fs.writeFileSync(outputPath, report.text);

  // Print report
  const LINE = '='.repeat(62);
  const DIV  = '-'.repeat(62);

  console.log(LINE);
  console.log('  TEAM AM — TEXT CLEANUP REPORT');
  console.log(LINE);
  console.log(`  Status: ${report.status}`);
  console.log(`  Tier: ${report.tier}`);
  console.log(`  Total changes: ${report.total_changes}`);
  console.log(DIV);

  if (report.changes.length > 0) {
    for (const c of report.changes) {
      const note = c.tier_note ? ` [${c.tier_note}]` : '';
      console.log(`  [${c.type}] "${c.original}" → "${c.replacement}" (×${c.count})${note}`);
    }
  } else {
    console.log('  No changes needed.');
  }

  console.log(DIV);
  console.log(`  Input:  ${inputPath}`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  Characters: ${report.text.length}`);
  console.log(LINE);

  // Also output JSON report to a sidecar file
  const reportPath = outputPath.replace(/\.md$/, '-cleanup-report.json');
  const jsonReport = { ...report };
  delete jsonReport.text; // Don't duplicate full text in report
  fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2));
  console.log(`  Report: ${reportPath}`);
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = { cleanupText };
