---
status: locked
version: 1.0
created: 2026-03-29
locked-date: 2026-03-29
purpose: Mandatory guardrails for all inter-AI communication scripts. No scripts may be built, committed, or used without full compliance with this document.
governing-files:
  - /Handoff-Protocols/AI-Handoff-Protocol.md v1.1
  - /Handoff-Protocols/AI-Role-Boundaries.md
  - /Handoff-Protocols/Escalation-Triggers.md
approved-by: Claude (primary governing authority)
pressure-tested-by: Grok (2026-03-29)
locked-by: Titan (2026-03-29)
---

# Inter-AI Communication Scripts — Guardrails

> **This document must be locked before any inter-AI communication scripts are created.**
> These guardrails exist because Grok's pressure-test (2026-03-29) identified high drift risk, competing source-of-truth risk, and shadow-protocol risk in the proposed scripts. Claude reviewed and conditionally approved the build subject to every constraint below.

---

## Guardrail 1 — Derived Status Banner

Every inter-AI communication script file must open with the following banner, exactly as written, in bold, before any other content:

> **⚠️ DERIVED OPERATIONAL AID ONLY — NOT AUTHORITATIVE.**
> **Locked governance files remain the single source of truth.**
> **This file must never be treated as a replacement for the governing documents listed below.**

The banner must be followed immediately by a list of the specific locked governance files the script derives from.

---

## Guardrail 2 — Verbatim Reference or Transclusion Only

Scripts must reference locked governance content using one of two methods:

1. **Transclusion** — embedding content directly from the locked source file (preferred)
2. **Verbatim quotation** — exact copy with source file and line reference cited

Scripts must **never**:
- Paraphrase, summarize, or reword locked governance rules
- Add interpretive language around locked rules
- Omit any part of a referenced rule or trigger condition

If a locked rule cannot be included in full, the script must link to the source file and instruct the reader to consult it directly.

---

## Guardrail 3 — Same Governance Standards Apply

All inter-AI communication scripts are subject to the same governance controls as locked artifacts:

- **Change-Approval-Rules.md** applies in full — no modifications without the standard approval sequence
- **Escalation-Triggers.md** applies in full — any of the five triggers halt work on scripts the same way they halt work on any other file
- **AI-Handoff-Protocol.md v1.1** applies in full — handoffs involving these scripts follow the same protocol as any other handoff

There are no exceptions. Convenience does not override governance.

---

## Guardrail 4 — Staleness Validation

Every inter-AI communication script must include a metadata block with the following fields:
```
last-validated-against:
  - AI-Handoff-Protocol.md v1.1 — validated [DATE]
  - AI-Role-Boundaries.md — validated [DATE]
  - Escalation-Triggers.md — validated [DATE]
```

Validation means a human operator or Claude (governing authority) has confirmed the script still accurately reflects the current locked versions of all governing files.

**Validation is required:**
- Before first commit
- After any change to any of the three governing files
- During every quarterly cross-audit (per two-vault architecture v3.1 guardrail 3)

A script with stale validation dates must not be used until re-validated.

---

## Guardrail 5 — Advisory Only, No Executable Logic

All routing logic in inter-AI communication scripts must be purely descriptive and advisory.

Scripts must **never**:
- Contain executable code that automates handoff decisions
- Include conditional logic that routes tasks without human judgment
- Replace or bypass the human operator's decision-making role
- Auto-select which AI receives a task

The human operator always decides. The scripts inform that decision — they do not make it.

---

## Guardrail 6 — Human-in-the-Loop Mandatory

No inter-AI communication script may be used in any workflow that removes the human operator from the decision chain. Specifically:

- No script may trigger an automated handoff between AIs
- No script may auto-generate prompts for another AI without operator review
- No script may be embedded in automation pipelines (GitHub Actions, webhooks, cron jobs, or similar) that execute without human confirmation

If any future tooling or workflow is proposed that would automate handoff execution, it must be escalated to Claude for review before implementation.

---

## Approved File Structure

**Placement:** Inside `/Handoff-Protocols/` — either flat with `OP-AID-` prefix or in a subfolder if permitted by `Team-AM-Repository-Structure-Locked.md`. Subfolder placement requires a structure check before creation.

**Routing logic:** One file only — `Handoff-Routing-Matrix.md` (or `OP-AID-Handoff-Routing-Matrix.md` if placed flat). No splitting by handoff type.

**Templates:** Minimal set only. Each template must derive entirely from locked governance files using transclusion or verbatim reference. No "helpful" additions beyond what the locked protocol specifies.

---

## What Happens If a Guardrail Is Violated

Any violation of these guardrails triggers the following sequence:

1. The violating file is immediately reverted or removed from the repo
2. The violation is logged in CHANGELOG.md
3. Claude (governing authority) reviews whether the file should be rebuilt or the concept abandoned
4. No further Track A work proceeds until the violation is resolved

---

## Approval Chain

1. ✅ Grok pressure-test completed (2026-03-29)
2. ✅ Claude reviewed and conditionally approved Track A (2026-03-29)
3. ✅ Titan reviewed and locked this document (2026-03-29)

---

*This is a locked artifact. Changes require the standard Change-Approval-Rules sequence.*
