---
status: active
version: 1.0
purpose: Defines change approval rules for all structural and governance updates.
governing-file: Team-AM-Repository-Structure-Locked.md
last-reviewed: 2026-03-26
---

# Change-Approval-Rules

Defines who may change what, under what conditions, and what must be recorded. All changes to this repository are governed by the locked structure in Team-AM-Repository-Structure-Locked.md.

---

## Core Changes (/Core/)
- /Core/ files (Client-Blueprint-12Step-Locked.md, Team-AM-Engine-Core-Locked.md) are immutable unless a full review cycle is initiated.
- No direct edits to /Core/ on main. All changes must come via a feature branch and explicit operator review before merge.
- Any change to /Core/ requires a CHANGELOG.md entry and a version bump on the affected file.

---

## Engine and Supporting-Engine Changes (/Engine/)
- /Engine/ subfolders (Policy/, Protocols/, Templates/, QA-Safety/, Guidance/) may be updated as the engine layer evolves.
- All /Engine/ files must transclude or cite /Core/ verbatim — no paraphrasing or restatement of locked content.
- Changes that alter logic, standards, or governance require a feature branch, operator self-review, and a CHANGELOG.md entry.
- Minor drafting edits and non-structural cleanup may be committed directly to main if branch protection does not block the path.

---

## Supporting Files (prompts, handoffs, MOC)
- May be updated with a lighter review path than /Core/ and /Engine/.
- Direct edits are allowed only if main is not protected for that file path and the change does not alter core logic.
- If branch protection requires PRs, use a feature branch and self-review before merge.

---

## Every Change
- Must include governing-file reference where applicable.
- Must preserve transclusion-first and no-duplication rules.
- Must be recorded in root CHANGELOG.md only if the change is material to structure, logic, standards, or repository governance.

---

## Changelog Rule
CHANGELOG.md tracks all material structural, logical, standards, and repository-governance changes. Minor drafting edits, typo corrections, and non-structural cleanup do not require a changelog entry unless they affect meaning or implementation.
