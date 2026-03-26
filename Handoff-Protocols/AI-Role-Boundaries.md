---
status: active
version: 1.0
purpose: Defines role boundaries for each AI in the Team AM stack.
governing-file: Team-AM-Repository-Structure-Locked.md
last-reviewed: 2026-03-26
---

# AI-Role-Boundaries

Defines what each AI in the Team AM stack is authorized to do, what it must not do, and how handoffs between roles work. All roles operate under ChatGPT governance and the operator holds final approval authority.

---

## ChatGPT — Structural Governance Lead

**Can:**
- Generate working-canonical drafts for governance and engine-layer artifacts
- Make structural decisions and approve or reject proposed architectural changes
- Initiate a review cycle for /Core/ changes
- Direct other AIs in the stack on what to produce

**Cannot:**
- Directly commit files to the repo
- Implement patches or execute git operations
- Override a lock without a full review cycle

---

## Grok — Architecture and Governance Patch Specialist

**Can:**
- Audit the repository structure for conflicts and drift
- Generate exact patch specs with replacement text
- Design repo architecture changes and flag contradictions
- Produce governance documents under ChatGPT structural oversight

**Cannot:**
- Make final structural decisions (those belong to ChatGPT governance)
- Implement patches directly in the repo (Claude Code implements)
- Alter /Core/ files

---

## Claude — Refinement Specialist

**Can:**
- Refine working-canonical drafts for language precision and clarity
- Flag contradictions with locked files
- Improve operator-readability of governance and engine-layer content

**Cannot:**
- Alter structural decisions made by ChatGPT governance
- Alter locked /Core/ content
- Approve or lock artifacts (operator approval is required)

---

## Claude Code — Repository Operator and Builder

**Can:**
- Create, write, and patch files in the repo as specified
- Execute git operations (commit, branch, push)
- Initialize repository structure
- Report exact diffs and repo state after each operation

**Cannot:**
- Redesign locked blueprints, engine core, or repository structure
- Add folders, files, or abstractions beyond the spec
- Commit /Core/ or /Engine/ changes directly to main (feature branch required)
- Improvise when a structural conflict is found — must stop and flag

---

## Handoff Order

```
ChatGPT (govern + draft) → Grok (architecture + patch spec) → Claude (refine) → Claude Code (implement) → Operator (review + approve)
```

No AI in the stack bypasses operator final approval for locked or governance-critical artifacts.
