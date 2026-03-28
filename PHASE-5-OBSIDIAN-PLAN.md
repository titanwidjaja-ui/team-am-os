---
status: approved
version: 3.1
date: 2026-03-28
purpose: Two-vault architecture — system vault (read-only repo view) and operations vault (daily working environment). Full structural separation with mandatory guardrails.
governing-file: Team-AM-Repository-Structure-Locked.md
pressure-tested-by: Grok (v2.0 rejected, v3.0 approved with guardrails)
approved-by: Claude (primary governing authority)
amends: PHASE-5-OBSIDIAN-PLAN.md v1.0
supersedes: v2.0 (rejected), v3.0 (approved with conditions)
drafted-by: Claude (primary governing authority)
---

# Phase 5 — Obsidian Vault Plan v3.1 (Final Approved)

## Design Principle

Two vaults. Completely separate folders. No shared files, no transclusions between them, no git connection between them. The system vault is the repo. The operations vault is where daily work happens. They never touch.

---

## Vault 1: System Vault (Read-Only)

### What It Is
The team-am-os repo clone opened as an Obsidian vault. Already built and verified in Phase 5 Track B. Nothing changes here.

### Location
Wherever the repo is currently cloned (e.g., `~/team-am-os/`)

### Structure
Unchanged from v1.0:

team-am-os/
├── .obsidian/              ← gitignored
├── 00-Dashboard/
│   └── Home.md             ← transclusion dashboard
├── _Templates/
│   └── .gitkeep
├── Core/                   ← LOCKED — never touch
├── Engine/                 ← read-only
├── Handoff-Protocols/      ← read-only
├── AI-Prompts/             ← read-only
└── [root files]            ← read-only

### Rules (Unchanged from v1.0)
- Read-only view layer — no original content
- All content via transclusion from synced repo only
- obsidian-git configured pull-only
- Push on commit-and-sync OFF
- .obsidian/ gitignored
- Any edit triggers immediate escalation to Claude

### When You Open It
When you need to reference the locked blueprint, engine core, governance files, or check the current build state. You must also open it every Monday as part of the weekly vault-switch drill (Guardrail 1).

---

## Vault 2: Operations Vault (Daily Working Environment)

### What It Is
A completely independent Obsidian vault for daily coaching operations. No git connection. No repo files. No transclusions from the system vault. This is where you live every day.

### Location

~/team-am-ops/

Created fresh. Not a clone. Not inside the repo. Not linked to GitHub.

### Structure

team-am-ops/
├── .obsidian/                    ← vault config, themes, plugins
├── 00-Dashboard/
│   └── Home.md                   ← daily command center
├── 01-Weekly-Plans/
│   └── [one note per week]
├── 02-Session-Logs/
│   └── [one note per session]
├── 03-Adjustment-Logs/
│   └── [one note per adjustment]
├── 04-Tasks/
│   └── [running task notes]
├── 05-Resources/
│   ├── Research/
│   └── Frameworks/
├── 06-Notes/
│   └── [scratch notes, ideas, journal]
└── _Templates/
    ├── Weekly-Plan-Template.md
    ├── Session-Log-Template.md
    ├── Adjustment-Log-Template.md
    └── Task-Template.md

### Folder Purposes

**00-Dashboard/** — Home.md is your daily command center. Shows this week's plan, today's sessions, active tasks, and recent adjustment logs. Uses Dataview queries to pull from the other folders dynamically.

**01-Weekly-Plans/** — One note per week. Goals, focus areas, scheduled sessions, priorities, end-of-week review. Named by week number (e.g., 2026-W14.md).

**02-Session-Logs/** — One note per client session. Client codes only — never real names. Named by date and code (e.g., 2026-03-28-Client-A.md). Real client data stays in Google Drive.

**03-Adjustment-Logs/** — Records of coaching adjustments. References the engine's adjustment protocol by memory after weekly vault-switch drill, not by transclusion or copy. Named by date and code (e.g., 2026-03-28-Client-A-Adj.md).

**04-Tasks/** — Running task management. Can use a single rolling task note or one note per project. Obsidian Tasks plugin tracks completion across the vault.

**05-Resources/** — Personal knowledge base. Training science notes, coaching frameworks, mental models, article summaries, reference material. Two subfolders: Research/ for external knowledge, Frameworks/ for your own models.

**06-Notes/** — Freeform space. Scratch notes, ideas, journal entries, session prep. No structure required.

**_Templates/** — All four operational templates. Used via Templater plugin for quick note creation with dynamic dates.

---

## Template Specifications

### Weekly-Plan-Template.md

---
source: ops-vault
type: weekly-plan
week: {{date:YYYY-[W]WW}}
created: {{date:YYYY-MM-DD}}
---

# Weekly Plan — {{date:YYYY-[W]WW}}

> [!warning] Before starting: open the system vault and review the engine core section relevant to this week's work. Confirm alignment before proceeding.

## Monday Vault-Switch Drill
- [ ] Opened system vault
- [ ] Reviewed relevant engine core section
- [ ] Confirmed alignment with locked rules

## Focus Areas
-

## Scheduled Sessions
| Day | Client Code | Time | Type |
|-----|-------------|------|------|
|     |             |      |      |

## Priority Tasks
- [ ]

## Notes

## End-of-Week Review

### Session-Log-Template.md

---
source: ops-vault
type: session-log
client-code:
date: {{date:YYYY-MM-DD}}
session-number:
---

# Session Log — {{date:YYYY-MM-DD}}

> [!warning] Reference system vault for locked rules. Do not copy or summarize core content here.

## Client Code

## Session Type

## Key Observations

## Adjustments Made

## Follow-Up Actions
- [ ]

## Notes

### Adjustment-Log-Template.md

---
source: ops-vault
type: adjustment-log
client-code:
date: {{date:YYYY-MM-DD}}
blueprint-step:
---

# Adjustment Log — {{date:YYYY-MM-DD}}

> [!warning] Reference system vault for locked rules. Do not copy or summarize engine adjustment logic here.

## Client Code

## Current Blueprint Step

## What Changed

## Why (Evidence or Observation)

## Expected Outcome

## Review Date

### Task-Template.md

---
source: ops-vault
type: task
created: {{date:YYYY-MM-DD}}
priority:
status: open
---

# Task

> [!warning] Reference system vault for locked rules.

## Context

## Due Date

## Linked To

---

## Dashboard Design — Home.md

---
source: ops-vault
type: dashboard
version: 1.0
---

# Team AM — Operations

> [!tip] System Reference
> Open the **team-am-os** vault (vault switcher → team-am-os) to view locked blueprints, engine core, and governance files. Do not copy system content into this vault.

---

## Monday Drill Check
> [!question] Have you completed this week's vault-switch drill?
> Open the system vault, review the relevant engine core section, and check off the drill in your weekly plan.

---

## This Week

(Dataview query: TABLE from 01-Weekly-Plans, sorted by week DESC, limit 1)

---

## Today's Sessions

(Dataview query: TABLE from 02-Session-Logs, filtered by today's date)

---

## Active Tasks

(Dataview query: TASK from 04-Tasks, where not completed)

---

## Recent Adjustments

(Dataview query: TABLE from 03-Adjustment-Logs, sorted by date DESC, limit 5)

---

## Quick Actions
- + New Weekly Plan (link to Weekly-Plan-Template)
- + New Session Log (link to Session-Log-Template)
- + New Adjustment Log (link to Adjustment-Log-Template)
- + New Task (link to Task-Template)

---

## Mandatory Guardrails (Grok-Required, Claude-Enforced)

### Guardrail 1 — Weekly Vault-Switch Drill
Every Monday before doing any operations work:
1. Open the system vault (team-am-os)
2. Navigate to the engine core section relevant to that week's adjustments
3. Read and confirm alignment with locked rules
4. Return to the operations vault
5. Check off the drill in that week's Weekly Plan note

This is non-negotiable. It prevents memory-based reinterpretation drift.

### Guardrail 2 — Visible Callout on Every Operations Note
Every template includes a warning callout at the top reminding the operator to reference the system vault for locked rules.

### Guardrail 3 — Quarterly Cross-Audit
Every 3 months:
1. Pull 3-5 random adjustment logs from the ops vault
2. Open the system vault and compare them against the engine core's locked adjustment logic
3. Check for drift in language, thresholds, field names, or scope
4. Log the audit result in a note in 06-Notes/ titled Quarterly-Audit-YYYY-QN.md
5. If drift is found, escalate to Claude before continuing

### Guardrail 4 — No New Folders or Templates Without Claude Approval
Any new top-level folder, subfolder, or template in the operations vault requires explicit approval from Claude before creation. No exceptions.

---

## Operations Vault Rules (Non-Negotiable)

1. **No repo files exist here** — the operations vault has zero connection to team-am-os
2. **No git** — this vault is not a git repository, not connected to GitHub, not synced to any remote repo
3. **No PII** — client codes only, real data stays in Google Drive
4. **No copies of /Core/ content** — if you need to reference the blueprint or engine, open the system vault
5. **Every note includes frontmatter** with source: ops-vault
6. **No new top-level folders or templates** without Claude approval
7. **Weekly vault-switch drill** every Monday — no exceptions
8. **Quarterly cross-audit** — compare ops notes against locked engine logic
9. **Backup is your responsibility** — use iCloud, Time Machine, or a separate backup method. Never push to team-am-os repo
10. **No summaries or notes about core content** — you may not create notes in the ops vault that describe, summarize, or reinterpret locked system files

## What the Operations Vault Must Never Contain

- Any copy, excerpt, summary, or rephrased version of /Core/ or /Engine/ files
- Client real names, emails, phone numbers, or any identifying information
- Governance documents, handoff protocols, or AI role boundary files
- Any file that belongs in the team-am-os repo
- Any git configuration or .git directory
- Any notes that reinterpret locked rules, thresholds, or protocols

---

## Recommended Plugins (Operations Vault)

| Plugin | Purpose | Required |
|--------|---------|----------|
| Templater | Template insertion with dynamic dates and fields | Yes |
| Dataview | Dynamic dashboard queries, table views | Yes |
| Tasks | Checkbox tracking and task queries across vault | Yes |
| Calendar | Visual weekly navigation, daily note access | Recommended |
| Minimal Theme | Clean, professional appearance | Recommended |
| Style Settings | Fine-tune Minimal Theme colors and typography | Recommended |
| Homepage | Auto-open Home.md on vault launch | Recommended |
| Iconize | Folder and file icons for visual clarity | Optional |
| Banners | Header images for dashboard polish | Optional |

---

## Visual Styling Plan

1. Install Minimal Theme — cleanest, most professional Obsidian theme
2. Install Style Settings plugin for fine-tuning
3. Set accent color to Team AM brand color
4. Enable readable line width for comfortable reading
5. Use callouts for visual section separation in dashboard
6. Configure folder icons via Iconize for instant visual recognition
7. Set font to a clean sans-serif (Inter, SF Pro, or system default)

---

## Connection Between the Two Vaults

There is no technical connection. They are two independent Obsidian vaults in two separate folders. You switch between them using Obsidian's vault switcher:

How to switch vaults:
1. Click the vault name in the bottom-left corner of Obsidian
2. Select the other vault from the list
3. Or use the keyboard shortcut: open Command Palette (Cmd+P) → type "Open another vault"

---

## Build Sequence (For Claude Code After Approval)

### Phase 1: Create Operations Vault
1. Run: mkdir -p ~/team-am-ops/{00-Dashboard,01-Weekly-Plans,02-Session-Logs,03-Adjustment-Logs,04-Tasks,05-Resources/Research,05-Resources/Frameworks,06-Notes,_Templates}
2. Create all four templates in _Templates/
3. Create 00-Dashboard/Home.md with Dataview queries

### Phase 2: Install and Configure Plugins
1. Open ~/team-am-ops/ as a new vault in Obsidian
2. Install Templater, Dataview, Tasks, Calendar
3. Install Minimal Theme
4. Install Style Settings, Homepage
5. Configure Homepage to open Home.md on launch
6. Configure Templater folder to _Templates/

### Phase 3: Apply Styling
1. Activate Minimal Theme
2. Set accent color
3. Configure readable line width
4. Set up callout styling in dashboard
5. Configure folder icons if Iconize installed

### Phase 4: Verify
1. Confirm system vault (team-am-os) is untouched
2. Confirm operations vault has no .git directory
3. Confirm no repo files exist in operations vault
4. Create one test note from each template to verify Templater works
5. Confirm Dataview queries render on Home.md
6. Delete test notes
7. Stop — no further changes without Claude approval

---

## Appendix A: Grok Pressure-Test Resolution Map

| Grok Concern (v2.0) | Resolution in v3.0/3.1 |
|---|---|
| Editable content inside repo root | Operations vault is a separate folder — zero repo contact |
| Duplication of engine logic | No transclusions from system files in ops vault |
| Shadow client-tracking system | Session logs exist only in ops vault, no git, no repo |
| Template evolution drift | Ops templates marked source: ops-vault, carry no system authority |
| Dashboard replacing repo navigation | Two separate vaults — dashboard only queries ops content |
| Adjustment-Log reinterpretation | Weekly vault-switch drill (Guardrail 1) prevents memory drift |
| Working copy becomes authority | Physical separation + mandatory weekly drill + quarterly audit |
| Recommended separate folder | Adopted — ~/team-am-ops/ is the ops vault root |

| Grok Concern (v3.0) | Resolution in v3.1 |
|---|---|
| Memory-based reinterpretation drift | Guardrail 1 — weekly vault-switch drill baked into Weekly Plan template |
| Ops vault becomes daily lived system | Guardrail 2 — visible callout on every template reminds operator |
| Gradual softening of locked rules | Guardrail 3 — quarterly cross-audit catches drift |
| Convenience overrides discipline | All four guardrails work together to maintain friction where it matters |
