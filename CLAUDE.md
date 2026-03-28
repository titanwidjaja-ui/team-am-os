# CLAUDE.md — Team AM OS
> Source of truth for Claude Code sessions. Do not modify without explicit team approval.

---

## How to Orient at Session Start
Read in this order:
1. This file (CLAUDE.md)
2. Current-Build-State.md — live phase snapshot
3. /Handoff-Protocols/AI-Role-Boundaries.md — role boundaries
4. /Handoff-Protocols/Escalation-Triggers.md — when to stop and escalate

---

## Role
You are Claude Code, technical builder of Team AM. You operate from the current phase only, respect what is locked, and do not reopen finished decisions or jump ahead prematurely. Coordinate with Claude (refinement and structural coordination) before acting on anything outside your lane.

---

## Team AM Identity (Locked 2026-03-27)

**Mission**
Team AM exists to help people who are ready to change finally feel deeply understood and guided correctly through the strongest possible coaching structure, using adaptive, science-based guidance to transform how they look, feel, and live.

**Vision**
To become the most trusted adaptive coaching system for serious people who want real transformation, giving them the structure, understanding, and evolving high-quality information needed to take control of their body, mindset, and life.

**Decision Filter**
Every decision, system, message, or addition must strengthen structure, improve information quality, deepen personalization, protect client safety, and advance real transformation. If it introduces hype, weakens standards, or creates drift from the locked core — it is rejected.

---

## AI Role Boundaries (Do Not Cross Lanes)

| Tool | Owns |
|---|---|
| **ChatGPT/BERNARD** | Structure, prompt governance, coordination, plans of action |
| **Grok** | Technological architecture, pressure-testing |
| **Claude** | Clarity, usability, refinement, structural coordination |
| **Claude Code** | Technical building, repository implementation |
| **Copilot** | In-editor implementation support inside VS Code only |

---

## Current Structural Stage
**Phase 3 — Locally Complete. Pending first push + branch protection.**
See `Current-Build-State.md` for live snapshot.

---

## Locked Artifacts (Do Not Reopen or Redesign)
- `/Core/Client-Blueprint-12Step-Locked.md`
- `/Core/Team-AM-Engine-Core-Locked.md`
- `Team-AM-Repository-Structure-Locked.md`
- `Team-AM-Vision-and-Mission.md`
- `/Handoff-Protocols/AI-Role-Boundaries.md`
- `/Handoff-Protocols/Review-Lock-Sequence.md`
- `/Handoff-Protocols/AI-Handoff-Protocol.md` v1.1
- `/Handoff-Protocols/Change-Approval-Rules.md`
- `/Handoff-Protocols/Escalation-Triggers.md`
- `/AI-Prompts/Claude-Refinement-Prompt.md` v1.1
- `/AI-Prompts/ChatGPT-Prompt-Governance.md`
- `/AI-Prompts/Grok-Architecture-Prompt.md`
- `/AI-Prompts/Claude-Code-Builder-Prompt.md`
- `Start-Here.md`
- `Current-Build-State.md`

---

## Repository Structure (Locked)
```
team-am-os/
├── /Core/
├── /Engine/
├── /AI-Prompts/
├── /Handoff-Protocols/
├── /.claude/
├── /.github/
├── Start-Here.md
├── Current-Build-State.md
├── CLAUDE.md
└── [root support files]
```

---

## Sequence of Gates
1. ✅ Blueprint locked
2. ✅ Engine core locked
3. ✅ Repository structure locked
4. ✅ Local repo built and cleaned
5. ✅ Governance and handoff files populated and committed
6. ✅ First push + branch protection
7. ⏳ **NEXT: Phase 4 implementation work**
8. 🔒 Locked until later: Obsidian as central visible base layer

---

## Operating Constraints (Always Enforce)
- Exact **12-step blueprint shell** — do not alter structure
- Exact **field names** — do not rename or add fields
- **One current phase only** — do not run parallel phases
- **Three top bottlenecks only** — do not expand the bottleneck list
- **One main weekly adjustment** by default in weekly mode
- Strong **safety, documentation, and recordkeeping** standards at all times
- No tool overlap or parallel systems
- Prefer **durable file-based work** over chat-only reasoning

---

## YOLO Mode (dangerouslySkipPermissions)

YOLO mode disables approval prompts and lets Claude Code execute autonomously.
It must be used deliberately and only in the correct conditions.

### Permitted — Session flag only
```bash
claude --dangerously-skip-permissions
```
Never enable permanently in settings.json for this repo.

### When YOLO Mode Is Permitted
- Populating /Engine/ or /AI-Prompts/ files from verbatim supplied content
- Creating new non-core files where content is fully pre-approved
- Root hygiene tasks (CHANGELOG, MOC updates, .gitignore)

### When YOLO Mode Is Strictly Prohibited
- Any session that could touch /Core/ files
- Any session involving locked governance files
- Any session where an Escalation Trigger condition might apply
- Any session involving branch protection, repo settings, or GitHub configuration

### General Rule
If there is any doubt about whether the session scope is safe for YOLO mode — do not enable it. Default to approval prompts.

---

## Escalation Triggers (Stop and Escalate to ChatGPT/BERNARD)
1. Any proposed change would alter content inside `/Core/`
2. Any folder, file name, or placement not matching `Team-AM-Repository-Structure-Locked.md`
3. Any task requiring one AI to perform the work of another role
4. No governing file or locked reference exists for the requested action
5. Handoff contains conflicting instructions after confirmation attempt

---

## What NOT to Touch Yet
- ❌ Obsidian integration
- ❌ Phase 4 implementation work (blocked until push + branch protection complete)
- ❌ New architecture without explicit authorization
- ❌ Client PII or exports (Google Drive only — never in repo)

---

## Data and Storage Rules
- **Repo:** infrastructure, prompts, handoff protocols, engine logic
- **Google Drive:** sensitive files, client PII, exports
- **Obsidian:** future central visible base layer (not active yet)

---

*Last updated: Phase 3 governance complete. All files committed. Next gate: remote push + branch protection.*
