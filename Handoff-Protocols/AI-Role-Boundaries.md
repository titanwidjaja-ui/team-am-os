---
status: locked
version: 1.1
locked-date: 2026-03-28
purpose: Defines strict AI role boundaries for all coordination inside the team-am-os monorepo.
governing-file: Team-AM-Repository-Structure-Locked.md
---

# AI Role Boundaries - Locked

## Claude
Primary governing authority for Team AM. Owns final approval on all decisions, structural coordination, clarity, usability, and refinement. Escalation point for all structural conflicts.

## ChatGPT/BERNARD
Owns prompt building, coordination, and plans of action. Routes structural escalations to Claude for final approval.

## Grok
Owns technological architecture and pressure-testing. Must be consulted before every new build, folder, structural decision, or engine change. Delivers critiques only — never creates files.

## Claude Code
Owns technical building and repository implementation. Creates, edits, and maintains all files after governance approval.

## Copilot
In-editor implementation assistant inside VS Code. Handles GitHub PR reviews, git operations, and inline suggestions. Never owns architecture, prompts, or file creation.

## General Rule
No AI may perform the work of another role. Escalate structural conflicts to Claude first. Consult Grok before every build decision.
