---
status: locked
version: 1.0
locked-date: 2026-03-28
purpose: Enforces hard separation between Team AM and all other projects.
governing-file: Team-AM-Repository-Structure-Locked.md
---

# Project Boundary — Team AM Only

## Rule
This repository, and all AI sessions working inside it, are strictly scoped to Team AM.

## What Does Not Belong Here
- Any file, prompt, data, or context from Titan Atlas or any other project
- Any client PII or exports from any project
- Any cross-project architecture or shared systems

## Enforcement
- Never open Team AM and Titan Atlas in the same AI session
- Always verify the correct repo with `git remote -v` before committing
- If any Titan Atlas content appears in a handoff or prompt, stop immediately and flag it as a boundary violation — treat it as Escalation Trigger 3

## Applies To
Claude, Claude Code, Grok, ChatGPT/BERNARD, Copilot, and any human operator
