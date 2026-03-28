---
status: working-canonical
version: 1.0
date: 2026-03-28
purpose: Defines the approved Obsidian vault structure and rules for Phase 5.
governing-file: Team-AM-Repository-Structure-Locked.md
pressure-tested-by: Grok
---

# Phase 5 — Obsidian Vault Plan

## Verdict
The vault is a thin, read-only visualization and daily operating dashboard only.
It surfaces and links to the repo's locked files. It does not create, store, or edit anything.

## Approved Vault Structure
team-am-vault/
├── 00-Dashboard/
│   └── Home.md
└── _Templates/
Two folders only. Nothing else is permitted.

## Vault Rules (Non-Negotiable)
1. Read-only view layer — no original content created in the vault
2. All content via transclusion or live query from synced repo only
3. Every note opens with frontmatter: source: team-am-os repo
4. No client names, PII, or client-specific data anywhere
5. No copies or summaries of /Core/ files — links only
6. Weekly audit verifies zero duplication of core content
7. Any edit touching core logic triggers immediate escalation to Claude

## What the Vault Must Never Contain
- Any copy, excerpt, or rephrased version of /Core/ files
- Client names, client data, or anything identifying a client
- Weekly check-in data, adjustment logs, or decision records
- Templates that are not strict transclusions from the repo
- Governance notes, handoff records, or change logs

## Failure Mode to Avoid
Vault folders fill with client notes, weekly logs, and rewritten core files.
Repo is treated as archival. Vault becomes the living system.
Maintenance collapses, auditability disappears, drift becomes permanent.

## When Phase 5 Opens
- Install obsidian-git plugin pointed at team-am-os repo root
- Build Home.md dashboard with transclusions only
- Build _Templates/ as strict embeds from repo templates
- No other folders or files created without Claude approval
