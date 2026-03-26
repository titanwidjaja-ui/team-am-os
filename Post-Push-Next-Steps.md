---
status: active
version: 1.0
purpose: Ordered next-steps after first push to remote is confirmed.
governing-file: Team-AM-Repository-Structure-Locked.md
last-reviewed: 2026-03-26
---

# Post-Push-Next-Steps

Complete after `git push -u origin main` is confirmed and branch protection is enabled.

---

## Immediate (same session)
- [ ] Verify remote repo state matches local: visit `github.com/titanwidjaja-ui/team-am-os` and confirm all folders and files are present
- [ ] Confirm branch protection is active: attempt a direct push to main — it should be blocked
- [ ] Confirm repo is set to private in GitHub Settings → General

## Near-Term (next working session)
- [ ] Add `.claude/settings.json` — Claude Code project-level config and permissions for team-am-os
- [ ] Add initial Claude Code agents or skills relevant to the Team AM stack as needed
- [ ] Add `.github/` support files as needed: PR template, issue template

## Engine Layer Population
- [ ] Populate `/Engine/Policy/Policy-Client-Scope.md` with real policy content
- [ ] Populate `/Engine/Protocols/Protocols-Phase-Transition.md` with real protocol content
- [ ] Populate remaining `/Engine/` stubs per working-canonical draft process (Review-Lock-Sequence.md)

## Later (do not begin yet)
- [ ] Begin Obsidian vault integration — link MOC-Repository.md as entry point
- [ ] Add client-instance folders or templates only if the repo structure explicitly supports them
- [ ] Any Google Drive or external system sync — only after governance is fully stable

## Do Not Do
- Do not add client PII, session exports, or sensitive data to this repo at any point
- Do not redesign locked /Core/ files outside a full review cycle
- Do not add new root folders without updating Team-AM-Repository-Structure-Locked.md first
