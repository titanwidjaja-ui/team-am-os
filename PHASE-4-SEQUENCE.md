---
status: working-canonical
version: 1.0
locked-date: 2026-03-28
purpose: Defines the approved task sequence for Phase 4 implementation.
governing-file: Team-AM-Repository-Structure-Locked.md
---

# Phase 4 Implementation Sequence

## Gate
Phase 4 opens only after Current-Build-State.md PR is merged and main is confirmed clean.

## Approved Sequence

### Task 1 — Merge Phase 4 Open PR
- Merge Current-Build-State.md v1.1 PR into main
- Tool: Claude Code
- Confirms Phase 3 fully closed and Phase 4 open

### Task 2 — GitHub Wiki Setup
- Enable GitHub Wiki on team-am-os
- Create initial page structure mirroring Start-Here.md read order
- Pages: Home, Current Build State, Locked Artifacts, AI Role Boundaries, Phase Sequence, Obsidian Plan
- Purpose: Human-readable navigation layer for the repo, bridge to future Obsidian layer
- Tool: Claude Code + operator

### Task 3 — Engine Starter Files
- Populate /Engine/ starter files
- Transclusion-only references from /Core/ — no direct edits to locked files
- Tool: Claude Code

### Task 4 — Obsidian Layer Planning
- Define Obsidian vault structure as central visible base layer
- Tool: Claude + ChatGPT/BERNARD

## What Stays Out of Scope for Phase 4
- Client PII or exports (Google Drive only)
- Any reopening of locked artifacts
- Any parallel systems or duplicate sources of truth
