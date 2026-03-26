---
status: active
version: 1.0
purpose: Pre-push verification checklist for the team-am-os first remote push.
governing-file: Team-AM-Repository-Structure-Locked.md
last-reviewed: 2026-03-26
---

# First-Push-Checklist

Complete in order before executing `git push -u origin main`.

---

## Remote and Auth
- [ ] Verify remote URL is correct: `git remote -v` → should show `https://github.com/titanwidjaja-ui/team-am-os.git`
- [ ] Generate GitHub Personal Access Token (PAT) at github.com → Settings → Developer settings → Tokens (classic) → scope: repo
- [ ] Confirm Terminal is open and working directory is `~/team-am-os`

## Push
- [ ] Run: `git push -u origin main`
- [ ] Enter username: `titanwidjaja-ui` and PAT when prompted
- [ ] Confirm push succeeded — no errors in Terminal output

## Post-Push Verification
- [ ] Visit `github.com/titanwidjaja-ui/team-am-os` — confirm repo is private
- [ ] Confirm `/Core/` contains exactly two files: `Client-Blueprint-12Step-Locked.md` and `Team-AM-Engine-Core-Locked.md`
- [ ] Confirm `Team-AM-Repository-Structure-Locked.md` is present at root
- [ ] Confirm no client PII, session exports, or sensitive data appears in any committed file

## Branch Protection
- [ ] GitHub → repo Settings → Branches → Add branch ruleset
- [ ] Branch: `main` — enable: Require pull request before merging, block force pushes
- [ ] Confirm CODEOWNERS file is visible in repo root (already committed)
