---
status: locked
version: 1.1
locked-date: 2026-03-26
purpose: Defines the mandatory format and confirmation rules for all handoffs between AI tools in the team-am-os monorepo.
governing-file: Team-AM-Repository-Structure-Locked.md
---

# AI-Handoff-Protocol - Locked

## Purpose
Every handoff must follow this exact format so the receiving AI has complete, verifiable context without guesswork.

## Required Handoff Elements
Every message from one AI to another must contain:
- Governing file(s) referenced (full path inside repo)
- Current phase and file status (e.g. "Phase 3 complete / Phase 4 open" + working-canonical or locked)
- Scope boundary — one line stating what the receiving tool should NOT do on this specific handoff
- Exact task type (structure/governance, architecture pressure-test, refinement, technical build, or implementation support)
- Link to the most recent version of the target artifact
- Any open decisions or explicit questions

## Receiving AI Confirmation
The receiving AI must reply with one of these exact lines before proceeding:
- "Context confirmed – governing file [[filename]] loaded, proceeding with [task type]."
- "Context incomplete – missing [specific item]. Requesting clarification."

## Conflict or Ambiguity Handling
If the handoff contains conflicting instructions or missing data, the receiving AI must immediately reply with:
"Conflict detected – [description]. Escalating per Escalation-Triggers.md."

## Handoff Type Differences
- Architecture pressure-test (Grok): Include drift-risk assessment only.
- Refinement (Claude): Include before/after wording comparison only.
- Technical build (Claude Code): Include exact file path and commit message template only.
- Governance/coordination (ChatGPT/BERNARD): Include phase alignment and next-step plan only.
- Copilot support: Limited to inline VS Code suggestions; no handoff ownership.
