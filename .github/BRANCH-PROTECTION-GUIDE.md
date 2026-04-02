# Branch Protection Setup for main

Go to: github.com/titanwidjaja-ui/team-am-os/settings/branches

Enable these rules on `main`:

1. ✅ Require a pull request before merging
   - Required approvals: 0 (solo operator)
   - ✅ Require review from Code Owners
2. ✅ Require status checks to pass before merging
   - Add: "markdownlint" (after the CI workflow is set up)
3. ✅ Include administrators (BUT keep "Allow bypass" enabled as escape hatch)
4. ❌ Do NOT require linear history (unnecessary for solo operator)
5. ❌ Do NOT require signed commits (unnecessary friction)

## Admin Merge Pattern (Solo Operator)
For quick fixes that don't touch /Core/ or CLAUDE.md:
- Push directly to main (admin bypass)

For changes to governance files:
- Create a branch, open a PR, review, merge

This tightens when team members are added.
