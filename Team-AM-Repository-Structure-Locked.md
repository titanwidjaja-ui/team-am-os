---
status: locked
version: 1.1
purpose: Canonical repository architecture for the Team AM AI operating system.
revision: 2026-03-26 – resolved Section 5 folder conflict per Grok governance patch
governing-ai: ChatGPT
governing-core-files:
  - Client-Blueprint-12Step-Locked.md
  - Team-AM-Engine-Core-Locked.md
---

# Team-AM-Repository-Structure-Locked

## 1. Locked Purpose

This file defines the canonical repository architecture for Team AM.

Its job is to lock:
- the root folder hierarchy
- what belongs in immutable core files versus supporting files
- file placement rules
- YAML frontmatter standards
- transclusion and citation conventions
- GitHub workflow standards
- AI handoff boundaries
- what is explicitly forbidden from entering the repository

No repository initialization, Claude Code implementation, or broader file creation should begin until this structure is treated as the active source of truth for the repository layer.

## 2. Locked Repository Identity

- Repository name: `team-am-os`
- Repository type: private GitHub monorepo
- Repository purpose: single source of truth for the Team AM AI operating system
- Repository scope: markdown-first operating system, locked core artifacts, supporting operating files, prompts, handoff rules, QA files, documentation, and future implementation notes
- Repository exclusion: raw client-sensitive files, signed documents, exports containing PII, progress photos, labs, and any other client file that belongs in Google Drive

## 3. Locked Root Structure

### Root Folders
- /Core/
- /Engine/
- /AI-Prompts/
- /Handoff-Protocols/

### Root Files
- CHANGELOG.md
- MOC-Repository.md
- README.md
- .gitignore
- LICENSE

## 4. Locked Core vs Supporting Separation

### 4.1 Immutable Core

Only these files belong in `/Core/`:
- `Client-Blueprint-12Step-Locked.md`
- `Team-AM-Engine-Core-Locked.md`

These are the immutable base artifacts.

They define the locked shell, field names, non-negotiables, and decision logic foundation.

They must not be paraphrased, redefined, or replaced in supporting files.

### 4.2 Supporting Files

Everything outside `/Core/` is a supporting file.

Supporting files may:
- clarify
- organize
- operationalize
- transclude
- cite
- package
- provide implementation-facing structure

Supporting files must not:
- create competing versions of core rules
- restate core content as if it were independent authority
- introduce drift by changing meaning through paraphrase

## Locked Folder Purposes (Aligned to Section 3)

- **/Core/** – Immutable locked foundation only. Contains exactly the two v1.0 files: Client-Blueprint-12Step-Locked.md and Team-AM-Engine-Core-Locked.md. Never edited without full review cycle.
- **/Engine/** – Supporting engine layers only (Policy/, Protocols/, Templates/, QA-Safety/, Guidance/, MOC-Engine.md). All files must transclude or cite /Core/ verbatim.
- **/AI-Prompts/** – One locked prompt file per AI role.
- **/Handoff-Protocols/** – AI role boundaries and workflow rules.
- **/CHANGELOG.md** – Master changelog at repo root.
- **/MOC-Repository.md** – Central map-of-content hub at repo root.

All other folders previously listed in older drafts (/QA/, /Docs/, /.github/, /.claude/) have been removed or consolidated per the locked root structure in Section 3. No new folders may be added without updating this file first.

## 6. Locked YAML Frontmatter Standard

All canonical markdown files inside the repository should use YAML frontmatter.

### 6.1 Locked files

```yaml
status: locked
version: 1.0
purpose: <clear purpose>
governing-ai: <responsible AI>
```

### 6.2 Working-canonical files

```yaml
status: working-canonical
version: <draft version>
purpose: <clear purpose>
governing-ai: <responsible AI>
```

### 6.3 Supporting files

```yaml
status: active
version: 1.0
purpose: <clear purpose>
governing-file: <core or parent file>
```

No frontmatter should include client-sensitive data.

## File-Naming Convention
Locked canonical files retain their exact approved names. Supporting files use PascalCase-With-Hyphens and a descriptive suffix where useful (for example: Policy-Client-Scope.md, Protocols-Weekly-Adjustment.md, QA-Safety-Full-Gates.md). Folder names use PascalCase without spaces. Every file ends in .md and contains mandatory YAML frontmatter with status, version, governing-file, and last-reviewed fields.

## 7. Locked Transclusion and Citation Rules

### 7.1 Core-first rule

If a supporting file relies on locked core logic, it must:
- transclude the relevant heading directly where possible
- or cite the governing core file explicitly
- and never silently paraphrase it as new authority

### 7.2 No duplication rule

Core logic must not be duplicated across prompts, engine support files, or documentation unless the duplication is clearly marked as a direct quoted block from the governing file.

### 7.3 Verbatim authority rule

The exact 12-step blueprint shell, exact field names, non-negotiables, and core decision rules remain authoritative only in the locked core files.

### 7.4 Prompt boundary rule

Prompt files may reference core rules, but they must not become the place where those rules are newly defined.

## 8. Locked GitHub Workflow Standard

### 8.1 Branching

- `main` = protected stable branch
- `dev` = active working branch
- feature branches for significant work

### 8.2 Protection standard

Changes to `/Core/` require the full review-lock sequence before merge.

### 8.3 Commit standard

Every meaningful commit must:
- be traceable to a file-level purpose
- reference the governing file when applicable

## CHANGELOG Rule
CHANGELOG.md tracks all material structural, logical, standards, and repository-governance changes. Minor drafting edits, typo corrections, and non-structural cleanup do not require a changelog entry unless they affect meaning or implementation.

## Single-Operator PR/Review Model
For solo operation, all changes to /Core/ or other governance-critical files should be made from a feature branch and reviewed by the operator before merge. One AI in the stack may be used as a review assistant before merge. Protected main branch is enforced for structural discipline, not for multi-person review.

## 9. Locked AI Handoff Boundaries

- ChatGPT governs structure, prompt architecture, sequencing, and canonical system decisions.
- Grok governs technical architecture and long-term durability decisions.
- Claude governs clarity, usability, wording, and refinement passes.
- Claude Code builds implementation artifacts after the repository structure is locked.
- Copilot assists inside VS Code and does not govern system architecture.

No AI should create a competing source of truth outside the repository once the repository is active.

## 10. Locked Repository Exclusions

The repository must never store:
- raw client-sensitive files
- signed forms
- progress photos
- labs
- exports containing PII
- working client documents that belong in Google Drive
- ephemeral chat-only decisions that were never translated into files

## 11. Locked Supporting Root Files

### `README.md`
Short explanation of repository purpose and usage boundaries.

### `MOC-Repository.md`
Top-level navigation hub linking all major folders and locked artifacts.

### `CHANGELOG.md`
Master change log for structural, logical, and file-standard changes.

### `.gitignore`
Must exclude:
- `.obsidian/workspace*`
- temporary files
- exported client-sensitive artifacts
- local-only settings where appropriate

### `LICENSE`
Internal-only use marker.

## 12. Locked Repository Build Sequence

The repository should be built in this order:
1. create root structure
2. place locked core files in `/Core/`
3. create `README.md`, `MOC-Repository.md`, `CHANGELOG.md`, and `.gitignore`
4. create supporting folder skeletons
5. create prompt and handoff files
6. create engine-support starter files
7. add `.github/` and `.claude/` structure
8. only then begin Claude Code implementation tasks inside the locked structure

## 13. Locked Decision

Before Claude Code begins repository implementation, this file must be treated as the canonical repository architecture authority.

No repo initialization should proceed under a different folder model unless this file is formally revised through the review-lock sequence.
