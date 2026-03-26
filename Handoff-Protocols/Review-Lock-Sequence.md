---
status: active
version: 1.0
purpose: Defines the review and lock sequence for governance changes in the Team AM stack.
governing-file: Team-AM-Repository-Structure-Locked.md
last-reviewed: 2026-03-26
---

# Review-Lock-Sequence

Defines the five-step sequence that all governance-critical and /Core/-touching artifacts must pass through before being locked. Supporting files and minor engine-layer updates may use a lighter path per Change-Approval-Rules.md.

---

## Five-Step Sequence

### 1. Working-Canonical Draft
Created under ChatGPT structural governance by the AI assigned to lead that artifact, with status: working-canonical.

### 2. Architecture Review
Grok audits the draft for structural conflicts, repo alignment, and drift from locked files. Grok produces a patch spec if corrections are needed, or clears the draft for the next step.

### 3. Refinement Pass
Claude reviews the cleared draft for language precision, internal consistency, and operator-readability. Returns inline redlines or a clean revised version. Flags any remaining contradictions with locked files.

### 4. Operator Review and Approval
The operator reviews the refined draft. This is the only step where final approval authority is exercised. The operator may return the artifact to any earlier step, approve as-is, or request targeted changes.

### 5. Lock and Commit
Claude Code implements the approved artifact — writes the file to the correct repo location, updates YAML frontmatter to status: active (or status: locked for /Core/ files), commits on the appropriate branch, and reports the final state. For /Core/ changes, a feature branch PR is required before merge to main.

---

## Lock Criteria
An artifact is considered locked when:
- It has passed all five steps
- The operator has explicitly approved it
- It is committed to the repo with the correct status in YAML frontmatter
- A CHANGELOG.md entry exists if the change is material to structure, logic, standards, or governance
