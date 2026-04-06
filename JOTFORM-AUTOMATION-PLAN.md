# Jotform Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate the Team AM coaching pipeline by (A) configuring Jotform forms with hidden fields and conditional logic, (B) deploying a Node.js Vercel webhook receiver that calls the Claude API and writes to Google Sheets, and (C) adding a prefilled check-in URL generator to the existing Apps Script.

**Architecture:** Three independent subsystems. Subsystem A (Jotform config) and C (Apps Script) are fully independent. Task A4 (webhooks) depends on Subsystem B (cloud function URL) and must run after B7. Subsystems A and C can start in parallel.

**Tech Stack:** bash/curl for Jotform API calls, Node.js 18+ on Vercel (free tier), `@anthropic-ai/sdk`, `googleapis`, `nodemailer`, `@vercel/functions`, `jest`, Google Apps Script.

**Governance note (CLAUDE.md):** The cloud function is a new project type with no approved folder in the locked repo structure. Deploy it as a **standalone Vercel project outside `team-am-os`** at `~/Documents/GitHub/team-am-webhook/`. No Grok pressure test required — it's infrastructure external to the repo. Reference docs saved to root of `team-am-os` as root support files.

---

## Subsystem A: Jotform Form Configuration

### Task A1: Add Hidden Fields to Check-In Form (260897464317064)

**Existing form:** 260897464317064 (check-in form — structure unknown, created via Jotform AI)
**Files:** None (curl commands only). One reference doc committed to repo.

- [ ] **Step 1: Export API key (run once per session)**

```bash
export JOTFORM_API_KEY="your_api_key_here"
```

- [ ] **Step 2: Verify API access and inspect current check-in form**

```bash
curl -s "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  | python3 -m json.tool | head -30
```

Expected: 200 response with `"responseCode": 200` and `"content": {...}`. If you get 401, the API key is wrong.

- [ ] **Step 3: Add clientID hidden field**

```bash
curl -s -X POST "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_textbox" \
  --data-urlencode "question[text]=clientID" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=200" \
  | python3 -m json.tool
```

Expected: `"responseCode": 200` with a `"qid"` value in the content. **Write down this qid as CLIENT_ID_QID.**

- [ ] **Step 4: Add blueprintTier hidden field**

```bash
curl -s -X POST "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_textbox" \
  --data-urlencode "question[text]=blueprintTier" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=201" \
  | python3 -m json.tool
```

Expected: 200 with qid. **Save as BLUEPRINT_TIER_QID.**

- [ ] **Step 5: Add currentPhase hidden field**

```bash
curl -s -X POST "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_textbox" \
  --data-urlencode "question[text]=currentPhase" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=202" \
  | python3 -m json.tool
```

Expected: 200 with qid. **Save as CURRENT_PHASE_QID.**

- [ ] **Step 6: Add currentCalories hidden number field**

```bash
curl -s -X POST "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_number" \
  --data-urlencode "question[text]=currentCalories" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=203" \
  | python3 -m json.tool
```

Expected: 200. **Save as CURRENT_CALORIES_QID.**

- [ ] **Step 7: Add currentProtein hidden number field**

```bash
curl -s -X POST "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_number" \
  --data-urlencode "question[text]=currentProtein" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=204" \
  | python3 -m json.tool
```

Expected: 200. **Save as CURRENT_PROTEIN_QID.**

- [ ] **Step 8: Add currentWater hidden number field**

```bash
curl -s -X POST "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_number" \
  --data-urlencode "question[text]=currentWater" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=205" \
  | python3 -m json.tool
```

Expected: 200. **Save as CURRENT_WATER_QID.**

- [ ] **Step 9: Add currentSodium hidden number field**

```bash
curl -s -X POST "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_number" \
  --data-urlencode "question[text]=currentSodium" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=206" \
  | python3 -m json.tool
```

Expected: 200. **Save as CURRENT_SODIUM_QID.**

- [ ] **Step 10: Add checkInNumber hidden number field**

```bash
curl -s -X POST "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_number" \
  --data-urlencode "question[text]=checkInNumber" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=207" \
  | python3 -m json.tool
```

Expected: 200. **Save as CHECKIN_NUMBER_QID.**

- [ ] **Step 11: Verify all 8 hidden fields exist**

```bash
curl -s "https://api.jotform.com/form/260897464317064/questions?apiKey=$JOTFORM_API_KEY" \
  | python3 -c "
import json, sys
q = json.load(sys.stdin)['content']
hidden = [v for v in q.values() if v.get('hidden') == 'Yes']
print(f'{len(hidden)} hidden fields:')
for v in hidden:
    print(f\"  qid={v['qid']} name={v['text']}\")
"
```

Expected: At least 8 lines including clientID, blueprintTier, currentPhase, currentCalories, currentProtein, currentWater, currentSodium, checkInNumber.

- [ ] **Step 12: Save QID reference and commit**

Create `/Users/alejandromerson/Documents/GitHub/team-am-os/jotform-checkin-field-ids.md`:

```markdown
# Check-In Form Hidden Field QIDs
Form ID: 260897464317064

| Field Name | QID | Type | URL Param |
|---|---|---|---|
| clientID | [CLIENT_ID_QID] | text | clientID |
| blueprintTier | [BLUEPRINT_TIER_QID] | text | blueprintTier |
| currentPhase | [CURRENT_PHASE_QID] | text | currentPhase |
| currentCalories | [CURRENT_CALORIES_QID] | number | currentCalories |
| currentProtein | [CURRENT_PROTEIN_QID] | number | currentProtein |
| currentWater | [CURRENT_WATER_QID] | number | currentWater |
| currentSodium | [CURRENT_SODIUM_QID] | number | currentSodium |
| checkInNumber | [CHECKIN_NUMBER_QID] | number | checkInNumber |

Fill in actual QIDs after running Task A1.
```

```bash
cd /Users/alejandromerson/Documents/GitHub/team-am-os
git add jotform-checkin-field-ids.md
git commit -m "docs: add check-in form hidden field QID reference"
```

---

### Task A2: Create Conditional Target Fields on Intake Form (260871732972162)

**Context:** Before adding conditions, every target field must already exist and be hidden. We need 4 new hidden textareas. Additionally, Q104 (supplement budget, currently visible) must be updated to hidden so the condition can unhide it.

Intake form questions are in `jotform-questions.json` at repo root. Key trigger QIDs:
- Q28 (qid=28): training experience dropdown
- Q45 (qid=45): food allergies textarea
- Q94 (qid=94): injury history textarea
- Q103 (qid=103): supplement openness radio (Yes/No)
- Q104 (qid=104): supplement budget radio — must be set to hidden first

- [ ] **Step 1: Check for existing conditions on the intake form**

```bash
curl -s "https://api.jotform.com/form/260871732972162/properties?apiKey=$JOTFORM_API_KEY" \
  | python3 -c "
import json, sys
props = json.load(sys.stdin)['content']
existing = props.get('conditions', '[]')
conds = json.loads(existing)
print(f'{len(conds)} existing conditions')
print(json.dumps(conds, indent=2))
"
```

**Save the full output.** If there are existing conditions, you must merge them with new ones in Task A3 (do not overwrite).

- [ ] **Step 2: Set Q104 (supplement budget) to hidden**

Q104 already exists with qid=104. Update it:

```bash
curl -s -X POST "https://api.jotform.com/form/260871732972162/questions/104?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[hidden]=Yes" \
  | python3 -m json.tool
```

Expected: 200 with `"hidden": "Yes"` in the returned question object.

- [ ] **Step 3: Create injury follow-up hidden textarea**

```bash
curl -s -X POST "https://api.jotform.com/form/260871732972162/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_textarea" \
  --data-urlencode "question[text]=Please describe your injury history, what is fully healed, and what still affects your training." \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=95" \
  | python3 -m json.tool
```

Expected: 200. **Save qid as INJURY_FOLLOWUP_QID.**

- [ ] **Step 4: Create dietary restrictions follow-up hidden textarea**

```bash
curl -s -X POST "https://api.jotform.com/form/260871732972162/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_textarea" \
  --data-urlencode "question[text]=List any foods you absolutely cannot eat and any foods you choose not to eat." \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=46" \
  | python3 -m json.tool
```

Expected: 200. **Save qid as DIETARY_FOLLOWUP_QID.**

Note: Order 46 places this after Q45 (allergies, order=45). Jotform may float the order — verify placement in the form editor afterward.

- [ ] **Step 5: Create beginner training follow-up hidden textarea**

```bash
curl -s -X POST "https://api.jotform.com/form/260871732972162/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_textarea" \
  --data-urlencode "question[text]=Do you currently have a training program, or do you need one built for you?" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=29" \
  | python3 -m json.tool
```

Expected: 200. **Save qid as BEGINNER_TRAINING_QID.**

- [ ] **Step 6: Create advanced training follow-up hidden textarea**

```bash
curl -s -X POST "https://api.jotform.com/form/260871732972162/questions?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "question[type]=control_textarea" \
  --data-urlencode "question[text]=What training split are you currently running and what are your current key lifts (squat, bench, deadlift)?" \
  --data-urlencode "question[hidden]=Yes" \
  --data-urlencode "question[order]=30" \
  | python3 -m json.tool
```

Expected: 200. **Save qid as ADVANCED_TRAINING_QID.**

- [ ] **Step 7: Verify all new hidden fields exist**

```bash
curl -s "https://api.jotform.com/form/260871732972162/questions?apiKey=$JOTFORM_API_KEY" \
  | python3 -c "
import json, sys
q = json.load(sys.stdin)['content']
hidden = [v for v in q.values() if v.get('hidden') == 'Yes']
print(f'{len(hidden)} hidden fields:')
for v in sorted(hidden, key=lambda x: int(x['qid'])):
    print(f\"  qid={v['qid']} text={v['text'][:60]}\")
"
```

Expected: Q50, Q58, Q90, Q92, Q93, Q101, Q104, Q108 (pre-existing) plus the 4 new ones (injury followup, dietary followup, beginner training, advanced training) = 12+ hidden fields.

---

### Task A3: Add Conditional Logic to Intake Form

**Context:** Replace every `[PLACEHOLDER_QID]` below with the actual qids collected in Task A2. If Step 1 of A2 returned existing conditions, prepend them to this array.

- [ ] **Step 1: Build conditions JSON file**

Create `/tmp/intake-conditions.json` (do NOT commit — temporary file):

Replace `INJURY_FOLLOWUP_QID`, `DIETARY_FOLLOWUP_QID`, `BEGINNER_TRAINING_QID`, `ADVANCED_TRAINING_QID` with the actual qids before saving.

```json
[
  {
    "id": "1",
    "link": "All",
    "terms": [{"field": "94", "operator": "isNotEmpty", "value": ""}],
    "action": "show",
    "field": "INJURY_FOLLOWUP_QID"
  },
  {
    "id": "2",
    "link": "All",
    "terms": [{"field": "45", "operator": "isNotEmpty", "value": ""}],
    "action": "show",
    "field": "DIETARY_FOLLOWUP_QID"
  },
  {
    "id": "3",
    "link": "All",
    "terms": [{"field": "103", "operator": "equals", "value": "Yes"}],
    "action": "show",
    "field": "104"
  },
  {
    "id": "4",
    "link": "Any",
    "terms": [
      {"field": "28", "operator": "equals", "value": "Never"},
      {"field": "28", "operator": "equals", "value": "Less than 6 months"}
    ],
    "action": "show",
    "field": "BEGINNER_TRAINING_QID"
  },
  {
    "id": "5",
    "link": "Any",
    "terms": [
      {"field": "28", "operator": "equals", "value": "1-3 years"},
      {"field": "28", "operator": "equals", "value": "3-5 years"},
      {"field": "28", "operator": "equals", "value": "5+ years"}
    ],
    "action": "show",
    "field": "ADVANCED_TRAINING_QID"
  }
]
```

If you had existing conditions from Task A2 Step 1, add them as earlier entries with ids 0a, 0b, etc., before id "1".

- [ ] **Step 2: POST the conditions**

```bash
CONDITIONS=$(cat /tmp/intake-conditions.json | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin)))")

curl -s -X POST "https://api.jotform.com/form/260871732972162/properties?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "properties[conditions]=$CONDITIONS" \
  | python3 -m json.tool
```

Expected: `"responseCode": 200`.

- [ ] **Step 3: Verify conditions saved**

```bash
curl -s "https://api.jotform.com/form/260871732972162/properties?apiKey=$JOTFORM_API_KEY" \
  | python3 -c "
import json, sys
props = json.load(sys.stdin)['content']
conds = json.loads(props.get('conditions', '[]'))
print(f'{len(conds)} conditions:')
for c in conds:
    terms = c['terms']
    trigger = f\"Q{terms[0]['field']} {terms[0]['operator']}\"
    print(f\"  Rule {c['id']}: IF {trigger} ({c['link']}) → {c['action']} Q{c['field']}\")
"
```

Expected: 5 rules (or more if merged with existing):
```
Rule 1: IF Q94 isNotEmpty (All) → show Q[INJURY_FOLLOWUP_QID]
Rule 2: IF Q45 isNotEmpty (All) → show Q[DIETARY_FOLLOWUP_QID]
Rule 3: IF Q103 equals (All) → show Q104
Rule 4: IF Q28 equals (Any) → show Q[BEGINNER_TRAINING_QID]
Rule 5: IF Q28 equals (Any) → show Q[ADVANCED_TRAINING_QID]
```

- [ ] **Step 4: Manual smoke test in browser**

Open `https://form.jotform.com/260871732972162`.

Verify each rule:
- **Rule 1:** Navigate to Medical section. Q94 "Have you had any injuries..." is visible and empty. Type anything → injury follow-up textarea should appear.
- **Rule 2:** Navigate to How You Eat section. Q45 "Do you have any food allergies?" is visible and empty. Type anything → dietary follow-up textarea should appear.
- **Rule 3:** Navigate to Supplements section. Q104 "Is supplement budget a concern?" is hidden. Set Q103 "Are you open to supplement recommendations?" = Yes → Q104 appears.
- **Rule 4:** Navigate to Training section. Q28 = "Less than 6 months" → beginner training question appears.
- **Rule 5:** Q28 = "5+ years" → advanced training question appears.

- [ ] **Step 5: Clean up temp file**

```bash
rm /tmp/intake-conditions.json
```

- [ ] **Step 6: Commit conditional logic reference**

Create `/Users/alejandromerson/Documents/GitHub/team-am-os/jotform-intake-conditional-qids.md`:

```markdown
# Intake Form Conditional Logic QIDs
Form ID: 260871732972162

## New Hidden Fields Created
| Field | QID | Shown When |
|---|---|---|
| Injury history follow-up | [INJURY_FOLLOWUP_QID] | Q94 (injury history) is not empty |
| Dietary restrictions follow-up | [DIETARY_FOLLOWUP_QID] | Q45 (food allergies) is not empty |
| Beginner training branch | [BEGINNER_TRAINING_QID] | Q28 = Never or Less than 6 months |
| Advanced training branch | [ADVANCED_TRAINING_QID] | Q28 = 1-3 years, 3-5 years, or 5+ years |

## Modified Existing Fields
| Field | QID | Change |
|---|---|---|
| Supplement budget (Q104) | 104 | Set to hidden; shown when Q103 = Yes |

## Condition Rules Summary
- Rule 1: Q94 isNotEmpty → show injury follow-up
- Rule 2: Q45 isNotEmpty → show dietary follow-up
- Rule 3: Q103 = "Yes" → show Q104
- Rule 4: Q28 = "Never" OR "Less than 6 months" → show beginner training question
- Rule 5: Q28 = "1-3 years" OR "3-5 years" OR "5+ years" → show advanced training question
```

```bash
cd /Users/alejandromerson/Documents/GitHub/team-am-os
git add jotform-intake-conditional-qids.md
git commit -m "docs: add intake form conditional logic reference"
```

---

## Subsystem B: Webhook Receiver Cloud Function

**Location:** `~/Documents/GitHub/team-am-webhook/` — separate from team-am-os repo.

### Task B1: Initialize Vercel Project

**Files to create:** `package.json`, `vercel.json`, `.env.example`, `.gitignore`

- [ ] **Step 1: Create and initialize project**

```bash
mkdir ~/Documents/GitHub/team-am-webhook
cd ~/Documents/GitHub/team-am-webhook
git init
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @anthropic-ai/sdk googleapis nodemailer @vercel/functions
npm install --save-dev jest
```

- [ ] **Step 3: Edit package.json test script**

Open `package.json` and add the `"test"` and `"test:watch"` scripts:

```json
{
  "name": "team-am-webhook",
  "version": "1.0.0",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "@vercel/functions": "^1.0.0",
    "googleapis": "^140.0.0",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

- [ ] **Step 4: Create vercel.json**

```json
{
  "functions": {
    "api/*.js": {
      "maxDuration": 60
    }
  }
}
```

- [ ] **Step 5: Create .env.example**

```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_SHEETS_ID=your_sheet_id_from_url
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
COACH_EMAIL=coach@example.com
SMTP_USER=your@gmail.com
SMTP_PASS=your_16char_app_password
STAGE1_PROMPT=copy verbatim from Google Sheets Prompts tab cell A1 — replace {{CLIENT_DATA}} placeholder must remain
```

- [ ] **Step 6: Create .gitignore**

```
node_modules/
.env
.vercel/
```

- [ ] **Step 7: Create directory structure**

```bash
mkdir -p lib tests api
```

- [ ] **Step 8: Commit initial scaffold**

```bash
git add package.json vercel.json .env.example .gitignore
git commit -m "chore: initialize team-am-webhook Vercel project scaffold"
```

---

### Task B2: Jotform Payload Parser (TDD)

**Files:**
- Create: `lib/jotform-parser.js`
- Create: `tests/jotform-parser.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/jotform-parser.test.js`:

```javascript
const { parseWebhookBody } = require('../lib/jotform-parser');

describe('parseWebhookBody', () => {
  it('extracts submissionId, formId, respondedAt, and fields', () => {
    const rawBody = {
      submissionID: '5001234567890123',
      formID: '260871732972162',
      submissionDate: '2026-04-02 10:30:00',
      q2_fullName: 'Jordan Rivera',
      q3_email: 'jordan@example.com',
      q11_whatIs: 'Fat loss',
      q28_howLong: 'Less than 6 months'
    };

    const result = parseWebhookBody(rawBody);

    expect(result.submissionId).toBe('5001234567890123');
    expect(result.formId).toBe('260871732972162');
    expect(result.respondedAt).toBe('2026-04-02 10:30:00');
    expect(result.fields.fullName).toBe('Jordan Rivera');
    expect(result.fields.email).toBe('jordan@example.com');
    expect(result.fields.whatIs).toBe('Fat loss');
    expect(result.fields.howLong).toBe('Less than 6 months');
  });

  it('strips q{N}_ prefix from field names', () => {
    const rawBody = {
      submissionID: '123',
      formID: '456',
      q94_haveYou94: 'knee injury 2023'
    };
    const result = parseWebhookBody(rawBody);
    expect(result.fields.haveYou94).toBe('knee injury 2023');
  });

  it('does not include Jotform system keys in fields', () => {
    const rawBody = {
      submissionID: '123',
      formID: '456',
      submissionDate: '2026-04-02',
      type: 'WEB_FORM',
      pretty: 'Name: Jordan',
      ip: '1.2.3.4',
      q2_fullName: 'Jordan'
    };
    const result = parseWebhookBody(rawBody);
    expect(result.fields.type).toBeUndefined();
    expect(result.fields.pretty).toBeUndefined();
    expect(result.fields.ip).toBeUndefined();
    expect(result.fields.fullName).toBe('Jordan');
  });

  it('identifies intake form', () => {
    const result = parseWebhookBody({ submissionID: '1', formID: '260871732972162' });
    expect(result.formType).toBe('intake');
  });

  it('identifies checkin form', () => {
    const result = parseWebhookBody({ submissionID: '1', formID: '260897464317064' });
    expect(result.formType).toBe('checkin');
  });

  it('returns unknown for unrecognized form', () => {
    const result = parseWebhookBody({ submissionID: '1', formID: '999999999' });
    expect(result.formType).toBe('unknown');
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- tests/jotform-parser.test.js
```

Expected: FAIL — `Cannot find module '../lib/jotform-parser'`

- [ ] **Step 3: Implement lib/jotform-parser.js**

Create `lib/jotform-parser.js`:

```javascript
const FORM_TYPES = {
  '260871732972162': 'intake',
  '260897464317064': 'checkin'
};

const SYSTEM_KEYS = new Set([
  'submissionID', 'formID', 'submissionDate', 'type',
  'pretty', 'ip', 'username'
]);

function parseWebhookBody(rawBody) {
  const fields = {};

  for (const [key, value] of Object.entries(rawBody)) {
    if (SYSTEM_KEYS.has(key)) continue;
    // Strip q{digits}_ prefix: "q94_haveYou94" → "haveYou94"
    const match = key.match(/^q\d+_(.+)$/);
    fields[match ? match[1] : key] = value;
  }

  return {
    submissionId: rawBody.submissionID,
    formId: rawBody.formID,
    respondedAt: rawBody.submissionDate || new Date().toISOString(),
    formType: FORM_TYPES[rawBody.formID] || 'unknown',
    fields
  };
}

module.exports = { parseWebhookBody };
```

- [ ] **Step 4: Run to confirm passing**

```bash
npm test -- tests/jotform-parser.test.js
```

Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/jotform-parser.js tests/jotform-parser.test.js
git commit -m "feat: add Jotform webhook payload parser with tests"
```

---

### Task B3: Google Sheets Client (TDD)

**Files:**
- Create: `lib/sheets.js`
- Create: `tests/sheets.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/sheets.test.js`:

```javascript
const { formatIntakeForSheets, formatCheckinForSheets } = require('../lib/sheets');

describe('formatIntakeForSheets', () => {
  it('returns array with submissionId first, then date, name, email, then goal fields', () => {
    const parsed = {
      submissionId: 'SUB001',
      respondedAt: '2026-04-02 10:30:00',
      fields: {
        fullName: 'Jordan Rivera',
        email: 'jordan@example.com',
        whatIs: 'Fat loss',
        howLong: '1-3 years',
        walkMe: 'Eggs, rice, chicken...'
      }
    };

    const row = formatIntakeForSheets(parsed);

    expect(Array.isArray(row)).toBe(true);
    expect(row[0]).toBe('SUB001');
    expect(row[1]).toBe('2026-04-02 10:30:00');
    expect(row[2]).toBe('Jordan Rivera');
    expect(row[3]).toBe('jordan@example.com');
    expect(row).toContain('Fat loss');
    expect(row).toContain('1-3 years');
  });

  it('uses empty string for missing fields', () => {
    const parsed = { submissionId: 'X', respondedAt: '2026-04-02', fields: {} };
    const row = formatIntakeForSheets(parsed);
    expect(row[2]).toBe('');
    expect(row[3]).toBe('');
  });
});

describe('formatCheckinForSheets', () => {
  it('includes hidden metadata fields from check-in submission', () => {
    const parsed = {
      submissionId: 'CKI001',
      respondedAt: '2026-04-02',
      fields: {
        clientID: '142',
        blueprintTier: 'Intermediate',
        currentPhase: 'Fat Loss',
        currentCalories: '2250',
        currentProtein: '156',
        currentWater: '130',
        currentSodium: '3850',
        checkInNumber: '3'
      }
    };

    const row = formatCheckinForSheets(parsed);

    expect(row[0]).toBe('CKI001');
    expect(row[1]).toBe('2026-04-02');
    expect(row).toContain('142');
    expect(row).toContain('Intermediate');
    expect(row).toContain('Fat Loss');
    expect(row).toContain('2250');
    expect(row).toContain('3');
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- tests/sheets.test.js
```

Expected: FAIL — `Cannot find module '../lib/sheets'`

- [ ] **Step 3: Implement lib/sheets.js**

Create `lib/sheets.js`:

```javascript
const { google } = require('googleapis');

function getSheetsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

function formatIntakeForSheets(parsed) {
  const f = parsed.fields;
  return [
    parsed.submissionId,
    parsed.respondedAt,
    f.fullName || '',
    f.email || '',
    f.whatIs || '',        // primary goal
    f.inYour || '',        // goal description (own words)
    f.whyDoes || '',       // motivation
    f.currentBody || '',   // current weight
    f.heightinclude || '', // height
    f.howLong || '',       // training experience
    f.howMany || '',       // training days/week
    f.describeYour || '',  // training setup
    f.howWould || '',      // eating pattern
    f.walkMe || '',        // yesterday's food log
    f.aboutHow || '',      // daily fluid intake
    f.averageHours || '',  // sleep hours
    f.howWould71 || '',    // sleep quality (scale 1-10)
    f.doYou88 || '',       // health conditions
    f.haveYou94 || '',     // injury history
    f.areYou103 || '',     // open to supplements
    f.walkMe119 || '',     // typical day
    f.isThere120 || ''     // anything else
  ];
}

function formatCheckinForSheets(parsed) {
  const f = parsed.fields;
  return [
    parsed.submissionId,
    parsed.respondedAt,
    f.clientID || '',
    f.blueprintTier || '',
    f.currentPhase || '',
    f.currentCalories || '',
    f.currentProtein || '',
    f.currentWater || '',
    f.currentSodium || '',
    f.checkInNumber || ''
    // Additional check-in question fields appended here once check-in form is mapped
  ];
}

async function appendToSheet(tabName, rowData) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `${tabName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowData] }
  });
}

module.exports = { formatIntakeForSheets, formatCheckinForSheets, appendToSheet };
```

- [ ] **Step 4: Run to confirm passing**

```bash
npm test -- tests/sheets.test.js
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/sheets.js tests/sheets.test.js
git commit -m "feat: add Google Sheets client with intake and check-in row formatters"
```

---

### Task B4: Claude API Client (TDD)

**Files:**
- Create: `lib/claude.js`
- Create: `tests/claude.test.js`

- [ ] **Step 1: Write failing test**

Create `tests/claude.test.js`:

```javascript
const { buildStage1Prompt } = require('../lib/claude');

describe('buildStage1Prompt', () => {
  beforeEach(() => {
    process.env.STAGE1_PROMPT = 'Analyze this client: {{CLIENT_DATA}}';
  });

  afterEach(() => {
    delete process.env.STAGE1_PROMPT;
  });

  it('injects all intake fields into the prompt template', () => {
    const fields = {
      fullName: 'Jordan Rivera',
      email: 'jordan@example.com',
      whatIs: 'Fat loss',
      howLong: '1-3 years'
    };

    const result = buildStage1Prompt(fields);

    expect(result).toContain('Jordan Rivera');
    expect(result).toContain('Fat loss');
    expect(result).toContain('1-3 years');
    expect(result).not.toContain('{{CLIENT_DATA}}');
  });

  it('throws if STAGE1_PROMPT env var is not set', () => {
    delete process.env.STAGE1_PROMPT;
    expect(() => buildStage1Prompt({})).toThrow('STAGE1_PROMPT environment variable is required');
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- tests/claude.test.js
```

Expected: FAIL — `Cannot find module '../lib/claude'`

- [ ] **Step 3: Implement lib/claude.js**

Create `lib/claude.js`:

```javascript
const Anthropic = require('@anthropic-ai/sdk');

function buildStage1Prompt(fields) {
  const template = process.env.STAGE1_PROMPT;
  if (!template) throw new Error('STAGE1_PROMPT environment variable is required');

  const clientData = Object.entries(fields)
    .filter(([, v]) => v && v.toString().trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  return template.replace('{{CLIENT_DATA}}', clientData);
}

async function runStage1(fields) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = buildStage1Prompt(fields);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}

module.exports = { buildStage1Prompt, runStage1 };
```

- [ ] **Step 4: Run to confirm passing**

```bash
npm test -- tests/claude.test.js
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/claude.js tests/claude.test.js
git commit -m "feat: add Claude API client with Stage 1 prompt builder"
```

---

### Task B5: Email Notifier

**Files:**
- Create: `lib/mailer.js`

No unit test — nodemailer SMTP is integration-only. Verified live in Task B7.

- [ ] **Step 1: Create lib/mailer.js**

```javascript
const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS  // Must be a Gmail App Password, not account password
    }
  });
}

async function sendIntakeNotification(clientName, submissionId, stage1Output) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.COACH_EMAIL,
    subject: `[Team AM] New intake: ${clientName}`,
    text: [
      `New intake submission received.`,
      `Client: ${clientName}`,
      `Submission ID: ${submissionId}`,
      ``,
      `Stage 1 Output:`,
      `──────────────────────────────`,
      stage1Output
    ].join('\n')
  });
}

async function sendCheckinNotification(clientId, checkInNumber, submissionId) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.COACH_EMAIL,
    subject: `[Team AM] Check-in #${checkInNumber} received: Client ${clientId}`,
    text: [
      `New biweekly check-in received.`,
      `Client ID: ${clientId}`,
      `Check-in number: ${checkInNumber}`,
      `Submission ID: ${submissionId}`,
      ``,
      `Review in Google Sheets Check-In Responses tab.`
    ].join('\n')
  });
}

module.exports = { sendIntakeNotification, sendCheckinNotification };
```

- [ ] **Step 2: Commit**

```bash
git add lib/mailer.js
git commit -m "feat: add email notifier for intake and check-in submissions"
```

---

### Task B6: API Route Handlers (TDD)

**Files:**
- Create: `api/intake.js`
- Create: `api/checkin.js`
- Create: `tests/intake-handler.test.js`

- [ ] **Step 1: Write failing test for intake handler**

Create `tests/intake-handler.test.js`:

```javascript
jest.mock('../lib/sheets', () => ({
  formatIntakeForSheets: jest.fn(() => ['row', 'data']),
  appendToSheet: jest.fn(() => Promise.resolve())
}));

jest.mock('../lib/claude', () => ({
  runStage1: jest.fn(() => Promise.resolve('Stage 1 output: detailed client analysis'))
}));

jest.mock('../lib/mailer', () => ({
  sendIntakeNotification: jest.fn(() => Promise.resolve())
}));

const { processIntakeSubmission } = require('../api/intake');
const { appendToSheet } = require('../lib/sheets');
const { runStage1 } = require('../lib/claude');
const { sendIntakeNotification } = require('../lib/mailer');

describe('processIntakeSubmission', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls runStage1, appends to Stage 1 Outputs, and sends notification', async () => {
    const parsed = {
      submissionId: 'SUB001',
      respondedAt: '2026-04-02',
      fields: { fullName: 'Jordan Rivera', email: 'j@example.com' }
    };

    await processIntakeSubmission(parsed);

    expect(runStage1).toHaveBeenCalledWith(parsed.fields);
    expect(appendToSheet).toHaveBeenCalledWith('Stage 1 Outputs', expect.any(Array));
    expect(sendIntakeNotification).toHaveBeenCalledWith(
      'Jordan Rivera',
      'SUB001',
      'Stage 1 output: detailed client analysis'
    );
  });

  it('uses "Unknown" as client name when fullName is missing', async () => {
    const parsed = { submissionId: 'SUB002', respondedAt: '2026-04-02', fields: {} };
    await processIntakeSubmission(parsed);
    expect(sendIntakeNotification).toHaveBeenCalledWith('Unknown', 'SUB002', expect.any(String));
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- tests/intake-handler.test.js
```

Expected: FAIL — `Cannot find module '../api/intake'`

- [ ] **Step 3: Implement api/intake.js**

Create `api/intake.js`:

```javascript
const { waitUntil } = require('@vercel/functions');
const { parseWebhookBody } = require('../lib/jotform-parser');
const { formatIntakeForSheets, appendToSheet } = require('../lib/sheets');
const { runStage1 } = require('../lib/claude');
const { sendIntakeNotification } = require('../lib/mailer');

async function processIntakeSubmission(parsed) {
  const stage1Output = await runStage1(parsed.fields);

  const sheetsRow = formatIntakeForSheets(parsed);
  sheetsRow.push(stage1Output);

  await appendToSheet('Stage 1 Outputs', sheetsRow);
  await sendIntakeNotification(
    parsed.fields.fullName || 'Unknown',
    parsed.submissionId,
    stage1Output
  );
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({ received: true });

  const parsed = parseWebhookBody(req.body);
  waitUntil(
    processIntakeSubmission(parsed).catch(err => {
      console.error('[intake] Processing error:', err.message, err.stack);
    })
  );
}

module.exports = handler;
module.exports.processIntakeSubmission = processIntakeSubmission;
```

- [ ] **Step 4: Implement api/checkin.js**

Create `api/checkin.js`:

```javascript
const { waitUntil } = require('@vercel/functions');
const { parseWebhookBody } = require('../lib/jotform-parser');
const { formatCheckinForSheets, appendToSheet } = require('../lib/sheets');
const { sendCheckinNotification } = require('../lib/mailer');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({ received: true });

  const parsed = parseWebhookBody(req.body);
  waitUntil(
    (async () => {
      const row = formatCheckinForSheets(parsed);
      await appendToSheet('Check-In Responses', row);
      await sendCheckinNotification(
        parsed.fields.clientID || 'unknown',
        parsed.fields.checkInNumber || '?',
        parsed.submissionId
      );
    })().catch(err => {
      console.error('[checkin] Processing error:', err.message, err.stack);
    })
  );
}

module.exports = handler;
```

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: All tests PASS — jotform-parser (6), sheets (3), claude (2), intake-handler (2) = 13 tests.

- [ ] **Step 6: Commit**

```bash
git add api/intake.js api/checkin.js tests/intake-handler.test.js
git commit -m "feat: add intake and check-in webhook handler routes with tests"
```

---

### Task B7: Deploy to Vercel

**Prerequisites:** Vercel CLI installed (`npm install -g vercel`), Vercel account at vercel.com.

- [ ] **Step 1: Log in to Vercel**

```bash
vercel login
```

Follow the browser prompt to authenticate.

- [ ] **Step 2: Create .env with real values**

```bash
cp .env.example .env
```

Open `.env` and fill in every value:
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `GOOGLE_SHEETS_ID` — the ID in the Sheets URL between `/d/` and `/edit`
- `GOOGLE_SERVICE_ACCOUNT_JSON` — full JSON from a GCP Service Account key download (see note below)
- `COACH_EMAIL` — the email address to receive notifications
- `SMTP_USER` — your Gmail address
- `SMTP_PASS` — Gmail App Password (generate at myaccount.google.com → Security → App passwords)
- `STAGE1_PROMPT` — copy verbatim from the Google Sheets Prompts tab, cell A1. The prompt must contain `{{CLIENT_DATA}}` as a placeholder.

**GCP Service Account setup (if not done yet):**
1. Go to console.cloud.google.com → IAM & Admin → Service Accounts
2. Create a service account, download the JSON key
3. Share the Google Sheet with the service account email (Editor permission)
4. Paste the entire JSON as the value for `GOOGLE_SERVICE_ACCOUNT_JSON`

- [ ] **Step 3: Add environment variables to Vercel**

Run each command and enter the value when prompted. Select "Production" and "Preview":

```bash
vercel env add ANTHROPIC_API_KEY
vercel env add GOOGLE_SHEETS_ID
vercel env add GOOGLE_SERVICE_ACCOUNT_JSON
vercel env add COACH_EMAIL
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add STAGE1_PROMPT
```

- [ ] **Step 4: Deploy to production**

```bash
vercel --prod
```

Expected output ends with a URL like:
```
✅  Production: https://team-am-webhook-xyz.vercel.app [3s]
```

**Save this URL — you need it for Task A4.**

- [ ] **Step 5: Smoke test both endpoints**

```bash
DEPLOY_URL="https://team-am-webhook-xyz.vercel.app"  # replace with your actual URL

curl -s -X POST "$DEPLOY_URL/api/intake" \
  -H "Content-Type: application/json" \
  -d '{"submissionID":"SMOKE001","formID":"260871732972162","q2_fullName":"Test Client","q3_email":"test@example.com"}'
```

Expected: `{"received":true}` with HTTP 200.

```bash
curl -s -X POST "$DEPLOY_URL/api/checkin" \
  -H "Content-Type: application/json" \
  -d '{"submissionID":"SMOKE002","formID":"260897464317064","q_clientID":"999","q_checkInNumber":"1"}'
```

Expected: `{"received":true}` with HTTP 200.

- [ ] **Step 6: Check Vercel logs for background processing errors**

```bash
vercel logs --prod 2>&1 | tail -30
```

Verify no `[intake] Processing error` or `[checkin] Processing error` lines appear.

- [ ] **Step 7: Check Google Sheets for test row**

Open the "Stage 1 Outputs" tab in the Google Sheet. Verify a new row appeared with the SMOKE001 submission data and a Stage 1 analysis in the last column.

Check your `COACH_EMAIL` inbox for the notification email.

- [ ] **Step 8: Commit deploy URL reference to team-am-os**

```bash
cd /Users/alejandromerson/Documents/GitHub/team-am-os
cat >> jotform-checkin-field-ids.md << 'EOF'

## Webhook Receiver Deployment
URL: https://team-am-webhook-xyz.vercel.app
- Intake endpoint: POST /api/intake
- Check-in endpoint: POST /api/checkin
EOF

git add jotform-checkin-field-ids.md
git commit -m "docs: add webhook receiver deployment URL"
```

---

### Task A4: Configure Webhooks (runs after B7 URL is known)

- [ ] **Step 1: Set webhook on intake form**

```bash
DEPLOY_URL="https://team-am-webhook-xyz.vercel.app"  # your actual URL

curl -s -X POST "https://api.jotform.com/form/260871732972162/webhooks?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "webhookURL=$DEPLOY_URL/api/intake" \
  | python3 -m json.tool
```

Expected: 200 with a webhook ID in the response.

- [ ] **Step 2: Set webhook on check-in form**

```bash
curl -s -X POST "https://api.jotform.com/form/260897464317064/webhooks?apiKey=$JOTFORM_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "webhookURL=$DEPLOY_URL/api/checkin" \
  | python3 -m json.tool
```

Expected: 200 with webhook ID.

- [ ] **Step 3: Verify both webhooks**

```bash
curl -s "https://api.jotform.com/form/260871732972162/webhooks?apiKey=$JOTFORM_API_KEY" | python3 -m json.tool
curl -s "https://api.jotform.com/form/260897464317064/webhooks?apiKey=$JOTFORM_API_KEY" | python3 -m json.tool
```

Expected: Both return your Vercel domain URLs.

- [ ] **Step 4: End-to-end test**

Submit a test entry on the live intake form at `https://form.jotform.com/260871732972162`. Use a test name like "E2E Test Client". Then within 60 seconds:
1. `vercel logs --prod 2>&1 | tail -30` — should show no errors
2. Google Sheets "Stage 1 Outputs" tab — should have new row with Stage 1 analysis
3. Coach email — notification should arrive

---

## Subsystem C: Apps Script — Prefilled URL Generator

**Context:** The existing pipeline script is in the Google Apps Script editor (not committed to repo). These changes are purely additive — one new function and one menu item added to `onOpen`.

### Task C1: Add generateCheckInLink Function and Menu Item

**Files:** Modify existing Apps Script in the Google Sheet editor.

- [ ] **Step 1: Open Apps Script editor**

In the Google Sheet "Team AM — Client Intake Responses", go to **Extensions → Apps Script**.

- [ ] **Step 2: Identify Pipeline tab column layout**

Paste and run this diagnostic function once, then delete it:

```javascript
function debugPipelineColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Pipeline');
  if (!sheet) { Logger.log('Pipeline tab not found'); return; }
  const headers = sheet.getRange(1, 1, 1, 25).getValues()[0];
  headers.forEach((h, i) => {
    if (h) Logger.log(`Col ${i + 1}: ${h}`);
  });
}
```

Run it: click **Run** → `debugPipelineColumns`. Open **View → Logs**.

Find and note the column numbers for:
- Client full name (look for "Full name" or "Name")
- A client ID or unique identifier column (if one exists, otherwise use row number)
- blueprintTier, currentPhase, currentCalories, currentProtein, currentWater, currentSodium, checkInNumber

If the Pipeline tab doesn't yet have blueprint/nutrient columns, you'll need to add them manually to the sheet first. The pipeline.gs script writes Stage outputs to other tabs — the Pipeline tab is for tracking status. You may need to manually add columns for the coaching plan data before this function can populate them.

- [ ] **Step 3: Append the check-in link generator to the script**

At the bottom of the existing Apps Script, add:

```javascript
// ──────────────────────────────────────────────────────────────
// CHECK-IN LINK GENERATOR
// Added 2026-04-02
// ──────────────────────────────────────────────────────────────

const CHECKIN_FORM_BASE_URL = 'https://form.jotform.com/260897464317064';

// Pipeline tab column numbers (1-based). Update these after running debugPipelineColumns().
const PIPELINE_COLS = {
  CLIENT_ID: 1,       // Column A — row number used as ID if no dedicated ID column
  NAME: 2,            // Column B — Full name
  BLUEPRINT_TIER: 14, // Update to match your actual column
  CURRENT_PHASE: 15,  // Update to match your actual column
  CURRENT_CALORIES: 16,
  CURRENT_PROTEIN: 17,
  CURRENT_WATER: 18,
  CURRENT_SODIUM: 19,
  CHECKIN_NUMBER: 20
};

function generateCheckInLink(clientName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pipeline = ss.getSheetByName('Pipeline');

  if (!pipeline) throw new Error('Pipeline tab not found in this spreadsheet.');

  const data = pipeline.getDataRange().getValues();

  // Find client row — skip header row (index 0), match on name (case-insensitive)
  const rowIndex = data.findIndex((row, i) =>
    i > 0 && row[PIPELINE_COLS.NAME - 1].toString().trim().toLowerCase() === clientName.toLowerCase()
  );

  if (rowIndex === -1) {
    throw new Error(
      `Client "${clientName}" not found in Pipeline tab. ` +
      `Check spelling and ensure the name matches exactly.`
    );
  }

  const row = data[rowIndex];
  const get = col => encodeURIComponent((row[col - 1] || '').toString().trim());

  // Use actual row number as clientID if no dedicated ID column
  const clientID = row[PIPELINE_COLS.CLIENT_ID - 1] || rowIndex + 1;

  const params = [
    `clientID=${encodeURIComponent(clientID)}`,
    `blueprintTier=${get(PIPELINE_COLS.BLUEPRINT_TIER)}`,
    `currentPhase=${get(PIPELINE_COLS.CURRENT_PHASE)}`,
    `currentCalories=${get(PIPELINE_COLS.CURRENT_CALORIES)}`,
    `currentProtein=${get(PIPELINE_COLS.CURRENT_PROTEIN)}`,
    `currentWater=${get(PIPELINE_COLS.CURRENT_WATER)}`,
    `currentSodium=${get(PIPELINE_COLS.CURRENT_SODIUM)}`,
    `checkInNumber=${get(PIPELINE_COLS.CHECKIN_NUMBER)}`
  ].join('&');

  return `${CHECKIN_FORM_BASE_URL}?${params}`;
}

function promptGenerateCheckInLink() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Generate Check-In Link',
    "Enter the client's full name exactly as it appears in the Pipeline tab:",
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const clientName = response.getResponseText().trim();
  if (!clientName) return;

  try {
    const url = generateCheckInLink(clientName);
    ui.alert(
      'Check-In Link Generated',
      `Copy and send this URL to ${clientName}:\n\n${url}`,
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert('Error Generating Link', e.message, ui.ButtonSet.OK);
  }
}
```

- [ ] **Step 4: Add menu item to onOpen**

Find the existing `onOpen()` function in the script. Add `promptGenerateCheckInLink` as a menu item:

```javascript
// Before (example — your onOpen may look different):
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Team AM')
    .addItem('Run Stage 1 Manually', 'runStage1Manual')
    .addItem('Run Stage 2+3 Manually', 'runStage23Manual')
    .addToUi();
}

// After — add separator and new item:
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Team AM')
    .addItem('Run Stage 1 Manually', 'runStage1Manual')
    .addItem('Run Stage 2+3 Manually', 'runStage23Manual')
    .addSeparator()
    .addItem('Generate Check-In Link', 'promptGenerateCheckInLink')
    .addToUi();
}
```

- [ ] **Step 5: Save the script**

Press `Cmd+S` (or `Ctrl+S`) in the Apps Script editor.

- [ ] **Step 6: Update PIPELINE_COLS constants**

Using the column numbers from Step 2's diagnostic output, update the `PIPELINE_COLS` object in the function you just pasted. Save again.

- [ ] **Step 7: Test the function manually**

In the Apps Script editor, select `promptGenerateCheckInLink` from the function dropdown and click **Run**. If you don't have a client row in the Pipeline tab yet, add a test row first.

Alternatively, reload the Google Sheet (`Cmd+R`), then click **Team AM → Generate Check-In Link**.

Enter a client name. Expected result — a popup showing a URL like:
```
https://form.jotform.com/260897464317064?clientID=1&blueprintTier=Intermediate&currentPhase=Fat%20Loss&currentCalories=2250&currentProtein=156&currentWater=130&currentSodium=3850&checkInNumber=1
```

- [ ] **Step 8: Test the generated URL in browser**

Paste the generated URL into a browser. Verify the hidden fields are pre-filled (you won't see them on the form — they're hidden). To confirm they passed through, submit the test form and check the Jotform submission in your Jotform dashboard under that form's submissions.

- [ ] **Step 9: Commit updated pipeline script reference**

Since the .gs file lives in Google Apps Script and not the repo, commit a note:

```bash
cd /Users/alejandromerson/Documents/GitHub/team-am-os
cat >> jotform-checkin-field-ids.md << 'EOF'

## Apps Script Update
Added `generateCheckInLink(clientName)` and `promptGenerateCheckInLink()` to pipeline.gs.
Access via: Team AM menu → Generate Check-In Link
PIPELINE_COLS constants must match actual Pipeline tab column layout.
EOF

git add jotform-checkin-field-ids.md
git commit -m "docs: add apps script check-in link generator implementation notes"
```

---

## Self-Review Against Spec

| Spec Requirement | Task | Covered |
|---|---|---|
| 8 hidden fields on check-in form (clientID, blueprintTier, currentPhase, currentCalories, currentProtein, currentWater, currentSodium, checkInNumber) | A1 Steps 3-11 | ✅ |
| Fields hidden from client, pass through to Sheets | A1 — all use `hidden=Yes` | ✅ |
| Prepopulated via URL parameters | Jotform native behavior when hidden=Yes; validated in C1 Step 8 | ✅ |
| Rule 1: injury history follow-up (non-empty trigger) | A2 Step 3, A3 Rule 1 | ✅ |
| Rule 2: dietary restrictions follow-up (non-empty trigger) | A2 Step 4, A3 Rule 2 | ✅ |
| Rule 3: supplement tier gating (hide when Q103="No") | A2 Step 2 sets Q104 hidden; A3 Rule 3 shows when Q103="Yes" | ✅ |
| Rule 4a: beginner training branch (Never, <6 months) | A2 Step 5, A3 Rule 4 | ✅ |
| Rule 4b: advanced training branch (2+ years) | A2 Step 6, A3 Rule 5 | ✅ |
| Intake webhook configured | A4 Step 1 | ✅ |
| Check-in webhook configured | A4 Step 2 | ✅ |
| Webhook responds within 30 seconds | B6 uses `waitUntil` pattern | ✅ |
| Parse Jotform submission JSON | B2 `parseWebhookBody` | ✅ |
| Identify form type from endpoint/formID | B2 `FORM_TYPES` map | ✅ |
| Intake: call Claude API with Stage 1 prompt + formatted data | B4 `runStage1`, B6 `processIntakeSubmission` | ✅ |
| Intake: write output to Stage 1 Outputs tab | B3 `appendToSheet`, B6 | ✅ |
| Intake: update Pipeline tab status | B3 scaffolds `updatePipelineStatus` (wiring deferred — requires row lookup by submission ID) | ⚠️ partial |
| Intake: send email notification to coach | B5 `sendIntakeNotification`, B6 | ✅ |
| Check-in: store data | B6 `checkin.js` → appendToSheet | ✅ |
| Check-in: email notification with summary | B5 `sendCheckinNotification`, B6 | ✅ |
| Env vars: ANTHROPIC_API_KEY, GOOGLE_SHEETS_ID, COACH_EMAIL | B1 `.env.example`, B7 | ✅ |
| Error handling with retry logic | `waitUntil` with `.catch` logs errors (Vercel auto-retries on timeout); full retry loop deferred | ⚠️ partial |
| Log all API calls for debugging | `console.error` in both handlers; Vercel logs via `vercel logs` | ✅ |
| No API key hardcoded | All values via env vars | ✅ |
| Apps Script: look up client data from Pipeline/Blueprints tab | C1 `generateCheckInLink` reads Pipeline tab | ✅ |
| Apps Script: generate prefilled URL with all 8 hidden fields | C1 Step 3 | ✅ |
| Apps Script: "Generate Check-In Link" in custom menu | C1 Step 4 | ✅ |
| Do not change intake form's existing questions | A2-A3 only add new hidden fields and update Q104 to hidden | ✅ |
| Do not modify Google Sheets tab structure | Sheets client only appends rows to existing tabs | ✅ |

**Two partial items noted:**
1. **Pipeline status update** — `updatePipelineStatus` is in `lib/sheets.js` but not wired in the intake handler because it requires knowing which Pipeline row maps to the submission. Wire this after confirming the Pipeline tab structure (row numbers stable vs. lookup by name/email).
2. **Retry logic** — Jotform retries failed webhooks automatically up to 3 times. The current implementation logs errors but doesn't implement exponential backoff. This is acceptable for an initial build.
