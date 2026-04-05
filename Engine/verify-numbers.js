'use strict';

// ============================================================
// TEAM AM — NUMERICAL VERIFICATION LAYER
//
// Sits between Stage 2 (blueprint generation) and Stage 3
// (QA gate). Extracts every numerical claim from the generated
// blueprint text and compares against calc-layer output.
//
// USAGE (module):
//   const { verifyNumbers } = require('./verify-numbers');
//   const report = verifyNumbers(calcOutput, blueprintText);
//
//   // With calorie cycling:
//   const report = verifyNumbers(calcOutput, blueprintText, {
//     calorie_cycling: {
//       training_day_calories: 2500,
//       rest_day_calories: 2800,
//       weekly_average: 2614,
//       rest_day_macros: { carbs_g: 250, fat_g: 103 }
//     }
//   });
//
// USAGE (CLI):
//   node Engine/verify-numbers.js calc-output.json blueprint.txt
//   node Engine/verify-numbers.js calc-output.json blueprint.txt --cycling cycling.json
// ============================================================

const fs   = require('fs');
const path = require('path');

// ============================================================
// FIELD DEFINITIONS
//
// Each entry maps keyword patterns found in blueprint text
// to the corresponding calc-layer output path.
// ============================================================

const FIELD_DEFS = [
  {
    field:    'target_calories',
    path:     'energy.daily_calories',
    keywords: [/\bcalories?\b/i, /\bcal\b/i, /\bkcal\b/i, /\bdaily\s+calories?\b/i]
  },
  {
    field:    'protein_g',
    path:     'macros.protein_grams',
    keywords: [/\bprotein\b/i]
  },
  {
    field:    'carbs_g',
    path:     'macros.carb_grams',
    keywords: [/\bcarbs?\b/i, /\bcarbohydrates?\b/i]
  },
  {
    field:    'fat_g',
    path:     'macros.fat_grams',
    keywords: [/\bfat\b/i]
  },
  {
    field:    'fiber_g',
    path:     'macros.fiber_grams',
    keywords: [/\bfiber\b/i, /\bfibre\b/i]
  },
  {
    field:    'fluids_oz',
    path:     'hydration.base_fluid_oz',
    keywords: [/\bfluids?\b/i, /\bwater\b/i, /\bhydration\b/i]
  },
  {
    field:    'sodium_mg',
    path:     'hydration.sodium_mg',
    keywords: [/\bsodium\b/i]
  },
  {
    field:    'potassium_mg',
    path:     'hydration.potassium_mg',
    keywords: [/\bpotassium\b/i]
  },
  {
    field:    'creatine_g',
    path:     'supplements.creatine_rounded',
    keywords: [/\bcreatine\b/i]
  },
  {
    field:    'tdee',
    path:     'energy.tdee_maintenance',
    keywords: [/\btdee\b/i, /\bmaintenance\b/i]
  },
  {
    field:    'bmr',
    path:     'energy.bmr',
    keywords: [/\bbmr\b/i, /\bbasal\s+metabolic\b/i]
  },
  {
    field:    'deficit',
    path:     'energy.deficit_amount',
    keywords: [/\bdeficit\b/i, /\bsurplus\b/i]
  }
];

// ============================================================
// TRAINING CONTEXT WHITELIST
//
// Lines matching these patterns contain training weights, rep
// schemes, or exercise references — numbers on these lines are
// NOT nutritional targets and should be excluded from checks.
// ============================================================

const TRAINING_CONTEXT_PATTERNS = [
  /\d+\s*[×x]\s*\d+/i,                              // rep schemes: 225×6, 275 x 8
  /\b(?:bench|squat|deadlift|overhead\s+press|ohp|barbell\s+row|dumbbell)\b.*\blbs?\b/i,
  /\blbs?\s+[×x]\s*\d+/i,                            // "lbs x 6"
  /\b(?:sets?\s+of|reps?\b.*\bRPE|RIR\s+\d)/i,       // "3 sets of 8", "RPE 8"
  /\b(?:bench(?:ing)?|squat(?:ting)?|deadlift(?:ing)?|press(?:ing)?)\s*:?\s*\d{3}/i  // "Bench: 225", "Squat 275"
];

function _isTrainingContextLine(line) {
  return TRAINING_CONTEXT_PATTERNS.some(re => re.test(line));
}

// ============================================================
// CORE: verifyNumbers(calcOutput, blueprintText, options) → report
//
// options.calorie_cycling (optional):
//   { training_day_calories, rest_day_calories, weekly_average,
//     rest_day_macros: { carbs_g, fat_g } }
// ============================================================

function verifyNumbers(calcOutput, blueprintText, options) {
  const opts    = options || {};
  const cycling = opts.calorie_cycling || null;

  const checks   = [];
  const failures = [];
  const warnings = [];

  // Build the set of accepted values per field when cycling is active
  const cyclingAccepted = _buildCyclingAccepted(cycling);

  for (const def of FIELD_DEFS) {
    const expected = _resolvePath(calcOutput, def.path);

    // Skip fields not present in the calc output
    if (expected === undefined || expected === null) continue;

    const expectedNum = Number(expected);
    if (isNaN(expectedNum)) continue;

    // Accepted values: base target + any cycling alternates
    const accepted = [expectedNum];
    if (cyclingAccepted[def.field]) {
      for (const alt of cyclingAccepted[def.field]) {
        if (!accepted.includes(alt)) accepted.push(alt);
      }
    }

    const found = _extractNearKeywords(blueprintText, def.keywords, accepted);

    if (found.length === 0) {
      checks.push({
        field:    def.field,
        expected: expectedNum,
        accepted: accepted.length > 1 ? accepted : undefined,
        found:    [],
        status:   'SKIP',
        note:     'No numerical values found near matching keywords'
      });
      continue;
    }

    // Find the best match — check against ALL accepted values
    const foundValues = found.map(f => f.value);
    let bestMatch     = found[0];
    let bestDev       = _minDeviationFromAccepted(accepted, found[0].value);

    for (let i = 1; i < found.length; i++) {
      const dev = _minDeviationFromAccepted(accepted, found[i].value);
      if (dev < bestDev) {
        bestDev   = dev;
        bestMatch = found[i];
      }
    }

    // Field status is determined by the best match
    let fieldStatus = 'PASS';

    if (bestDev > 2) {
      fieldStatus = 'FAIL';
      failures.push({
        field:     def.field,
        expected:  expectedNum,
        accepted:  accepted.length > 1 ? accepted : undefined,
        found:     bestMatch.value,
        deviation: `${bestDev.toFixed(1)}%`,
        location:  bestMatch.location
      });
    } else if (bestDev > 0) {
      fieldStatus = 'WARN';
      warnings.push({
        field:     def.field,
        expected:  expectedNum,
        accepted:  accepted.length > 1 ? accepted : undefined,
        found:     bestMatch.value,
        deviation: `${bestDev.toFixed(1)}%`,
        location:  bestMatch.location
      });
    }

    checks.push({
      field:    def.field,
      expected: expectedNum,
      accepted: accepted.length > 1 ? accepted : undefined,
      found:    foundValues,
      status:   fieldStatus
    });
  }

  // Overall status: worst of all field statuses
  let status = 'PASS';
  if (warnings.length > 0) status = 'WARN';
  if (failures.length > 0) status = 'FAIL';

  return { status, checks, failures, warnings };
}

// ============================================================
// CYCLING SUPPORT
//
// Builds a map of field → [alternate accepted values] from the
// calorie_cycling option.
// ============================================================

function _buildCyclingAccepted(cycling) {
  if (!cycling) return {};

  const accepted = {};

  // Calorie targets: accept training day, rest day, weekly average
  const calAlts = [];
  if (cycling.training_day_calories) calAlts.push(cycling.training_day_calories);
  if (cycling.rest_day_calories)     calAlts.push(cycling.rest_day_calories);
  if (cycling.weekly_average)        calAlts.push(Math.round(cycling.weekly_average));
  if (calAlts.length > 0) accepted.target_calories = calAlts;

  // TDEE/maintenance: also accept these calorie values since "maintenance"
  // keyword appears near cycling numbers in blueprint text
  if (calAlts.length > 0) accepted.tdee = calAlts;

  // Rest-day macros if explicitly provided
  if (cycling.rest_day_macros) {
    const rm = cycling.rest_day_macros;
    if (rm.carbs_g !== undefined)  accepted.carbs_g = [rm.carbs_g];
    if (rm.fat_g !== undefined)    accepted.fat_g   = [rm.fat_g];
  }

  // If rest-day macros not explicit but rest-day calories are, derive them.
  // Assumes protein stays constant, extra calories split across carbs and fat.
  if (!cycling.rest_day_macros && cycling.rest_day_calories && cycling.training_day_calories) {
    const diff = cycling.rest_day_calories - cycling.training_day_calories;
    if (diff > 0) {
      // Accept a range: all extra to carbs, all extra to fat, or 50/50 split
      // We don't know the exact split, so accept values within the plausible range
      accepted._cycling_calorie_diff = diff;
    }
  }

  return accepted;
}

function _minDeviationFromAccepted(accepted, foundValue) {
  let minDev = Infinity;
  for (const val of accepted) {
    const dev = _percentDeviation(val, foundValue);
    if (dev < minDev) minDev = dev;
  }
  return minDev;
}

// ============================================================
// TEXT EXTRACTION — LINE-BASED
//
// For each line containing a keyword match, extract all numbers
// from that line. Line scoping prevents cross-field contamination
// that proximity windows cause in dense blueprint text.
//
// Lines identified as training context (rep schemes, lift weights)
// are excluded to prevent false positives from numbers like 225,
// 275, 315 appearing near nutrition keywords.
// ============================================================

// Matches integers, decimals, and comma-formatted numbers.
// Uses \d+ (not \d{1,3}) so plain numbers like 3850 are captured whole.
const NUMBER_RE = /(\d+(?:,\d{3})*(?:\.\d+)?)/g;

// When a keyword matches on a heading line (e.g., "### Fat"), the actual
// number is often on the next line. Scan this many lines ahead for numbers.
const KEYWORD_LOOKAHEAD_LINES = 2;

function _extractNearKeywords(text, keywords, acceptedValues) {
  // acceptedValues is an array of numbers to use for plausibility filtering
  const primaryExpected = acceptedValues[0];

  const results = [];
  const seen    = new Set();
  const lines   = text.split('\n');

  // Pre-compute cumulative offsets for absolute positioning
  const lineOffsets = new Array(lines.length);
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    lineOffsets[i] = offset;
    offset += lines[i].length + 1;
  }

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    // Check if any keyword matches on this line
    let hasKeyword = false;
    for (const kwRegex of keywords) {
      if (kwRegex.test(line)) {
        hasKeyword = true;
        break;
      }
    }

    if (!hasKeyword) continue;

    // Extract numbers from this line AND the next KEYWORD_LOOKAHEAD_LINES lines.
    // This handles markdown headings where the keyword is on one line
    // (e.g., "### Fat") and the value is on the next (e.g., "78g daily").
    const scanEnd = Math.min(lines.length, lineIdx + 1 + KEYWORD_LOOKAHEAD_LINES);

    for (let scanIdx = lineIdx; scanIdx < scanEnd; scanIdx++) {
      const scanLine = lines[scanIdx];

      // Skip lines that are training context (rep schemes, lift weights)
      if (_isTrainingContextLine(scanLine)) continue;

      let numMatch;
      const numRe = new RegExp(NUMBER_RE.source, 'g');
      while ((numMatch = numRe.exec(scanLine)) !== null) {
        const raw    = numMatch[1];
        const parsed = parseFloat(raw.replace(/,/g, ''));
        const pos    = numMatch.index;

        if (isNaN(parsed)) continue;

        // Skip version numbers (preceded by 'v' or 'V')
        if (pos > 0 && /[vV]/.test(scanLine[pos - 1])) continue;

        // Skip years (1900–2099)
        if (parsed >= 1900 && parsed <= 2099) continue;

        // Skip very small numbers when expected is large (likely ratios)
        if (parsed < 1 && primaryExpected >= 10) continue;

        // Plausibility: within 50% of ANY accepted value
        const minDev = _minDeviationFromArray(acceptedValues, parsed);
        if (minDev > 50) continue;

        const dedupeKey = `${parsed}@L${scanIdx}P${pos}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const absPos  = lineOffsets[scanIdx] + pos;
        const context = _contextSnippet(scanLine, pos);

        results.push({
          value:    parsed,
          position: absPos,
          location: `line ${scanIdx + 1}: ...${context}...`
        });
      }
    }
  }

  return results;
}

// ============================================================
// HELPERS
// ============================================================

function _resolvePath(obj, dotPath) {
  return dotPath.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function _percentDeviation(expected, found) {
  if (expected === 0) return found === 0 ? 0 : 100;
  return Math.abs((found - expected) / expected) * 100;
}

function _minDeviationFromArray(values, found) {
  let minDev = Infinity;
  for (const val of values) {
    const dev = _percentDeviation(val, found);
    if (dev < minDev) minDev = dev;
  }
  return minDev;
}

function _contextSnippet(line, position) {
  const start = Math.max(0, position - 25);
  const end   = Math.min(line.length, position + 25);
  return line.substring(start, end).trim();
}

// ============================================================
// CLI ENTRY POINT
// ============================================================

/* istanbul ignore next */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node verify-numbers.js <calc-output.json> <blueprint.txt> [--cycling cycling.json]');
    console.error('');
    console.error('  calc-output.json  — JSON file with calc-layer computeTargets() output');
    console.error('  blueprint.txt     — Stage 2 generated blueprint text file');
    console.error('  --cycling file    — optional calorie cycling config JSON');
    process.exit(1);
  }

  const calcPath      = path.resolve(args[0]);
  const blueprintPath = path.resolve(args[1]);

  if (!fs.existsSync(calcPath)) {
    console.error(`Error: calc output file not found: ${calcPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(blueprintPath)) {
    console.error(`Error: blueprint file not found: ${blueprintPath}`);
    process.exit(1);
  }

  let calcOutput;
  try {
    calcOutput = JSON.parse(fs.readFileSync(calcPath, 'utf8'));
  } catch (e) {
    console.error(`Error: failed to parse calc output JSON: ${e.message}`);
    process.exit(1);
  }

  const blueprintText = fs.readFileSync(blueprintPath, 'utf8');

  // Parse optional cycling config
  let options = {};
  const cyclingIdx = args.indexOf('--cycling');
  if (cyclingIdx !== -1 && args[cyclingIdx + 1]) {
    const cyclingPath = path.resolve(args[cyclingIdx + 1]);
    if (fs.existsSync(cyclingPath)) {
      try {
        options.calorie_cycling = JSON.parse(fs.readFileSync(cyclingPath, 'utf8'));
      } catch (e) {
        console.error(`Error: failed to parse cycling JSON: ${e.message}`);
        process.exit(1);
      }
    }
  }

  const report = verifyNumbers(calcOutput, blueprintText, options);

  // Print report
  const LINE = '='.repeat(62);
  const DIV  = '-'.repeat(62);

  console.log(LINE);
  console.log('  TEAM AM — NUMERICAL VERIFICATION REPORT');
  console.log(LINE);
  console.log(`  Status: ${report.status}`);
  console.log(`  Fields checked: ${report.checks.length}`);
  console.log(`  Failures: ${report.failures.length}`);
  console.log(`  Warnings: ${report.warnings.length}`);
  if (options.calorie_cycling) console.log(`  Calorie cycling: active`);
  console.log(DIV);

  for (const check of report.checks) {
    const icon = check.status === 'PASS' ? 'PASS' :
                 check.status === 'WARN' ? 'WARN' :
                 check.status === 'SKIP' ? 'SKIP' : 'FAIL';
    const foundStr = check.found.length > 0 ? check.found.join(', ') : '(none)';
    const acceptStr = check.accepted ? ` (also accepts: ${check.accepted.join(', ')})` : '';
    console.log(`  [${icon}] ${check.field}: expected ${check.expected}${acceptStr}, found [${foundStr}]`);
  }

  if (report.failures.length > 0) {
    console.log('\n' + DIV);
    console.log('  FAILURES:');
    for (const f of report.failures) {
      console.log(`    ${f.field}: expected ${f.expected}, got ${f.found} (${f.deviation} off)`);
      console.log(`      at ${f.location}`);
    }
  }

  if (report.warnings.length > 0) {
    console.log('\n' + DIV);
    console.log('  WARNINGS (within 2% tolerance):');
    for (const w of report.warnings) {
      console.log(`    ${w.field}: expected ${w.expected}, got ${w.found} (${w.deviation} off)`);
      console.log(`      at ${w.location}`);
    }
  }

  console.log('\n' + LINE);

  // Output JSON to stdout if piped (not a TTY)
  if (!process.stdout.isTTY) {
    console.log(JSON.stringify(report, null, 2));
  }

  // Exit code reflects status
  process.exit(report.status === 'FAIL' ? 1 : 0);
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = { verifyNumbers };
