# Blueprint Production Playbook

## Pre-Production Checklist

- [ ] Client intake data in Google Sheets (verify webhook delivered or pull manually)
- [ ] Run Stage 1 Pre-Call Analysis
- [ ] Review Stage 1 gaps and red flags
- [ ] Complete onboarding call using Stage 1 findings as guide
- [ ] Write detailed call notes immediately after call
- [ ] Determine: phase, tier depth, supplement tier, special considerations

## Production Pipeline

- [ ] Run Stage 1.5 Call Notes Integration (~$0.50)
- [ ] Run Calc Layer and VERIFY all numbers manually
  - BMR reasonable for age/weight/height/sex?
  - TDEE matches activity level?
  - Deficit/surplus appropriate for phase?
  - Protein at 1.0g/lb minimum?
  - Fat above 0.3g/lb floor?
  - Fluid targets scaled to bodyweight?
  - Electrolytes scaled to fluid intake?
  - Creatine at 0.06g/lb?
- [ ] Run Stage 2 Blueprint Generation (~$1.25)
  - Expert tier for gold-standard clients
  - Standard tier for AM clients
- [ ] Run cleanup-text.js (--tier expert or --tier standard)
- [ ] Run verify-numbers.js (must PASS, false positives for calorie cycling are expected)
- [ ] Run Stage 3 QA Gate (37 checks, 0 BLOCKs required)
- [ ] Resolve all WARNs before proceeding

## Quality Gates

- [ ] Coach reads EVERY page personally
- [ ] Step 01 reflects specific client details from the call
- [ ] All numbers match calc layer exactly
- [ ] Training program respects injuries and equipment
- [ ] Meal structure fits their actual schedule and eating window
- [ ] Voice sounds like Alejandro, not a chatbot
- [ ] No em dashes, no banned words, no AI phrases
- [ ] Would you be proud to show this to someone as an example?

## Export and Delivery

- [ ] Export to HTML using master template (v5 with visual elements)
- [ ] Verify dark theme renders correctly
- [ ] Verify all charts, icons, and visual elements populated
- [ ] Host at teamamtraining.com/blueprints/[client-id].html
- [ ] Use obscured client-id (random string, not their name)
- [ ] Send link via iMessage with welcome message
- [ ] Update Pipeline Tracker with delivery date
- [ ] Set next check-in reminder (14 days for AM, 7 days for Pro/Elite)

## Post-Delivery

- [ ] Follow up 48 hours after delivery: "Had a chance to look through everything?"
- [ ] Answer any questions
- [ ] Confirm they have MacroFactor or tracking app set up
- [ ] Confirm they understand the check-in process

## Scaling Notes

- At 5+ clients: batch Stage 1 runs, schedule calls on specific days
- At 10+ clients: consider automating the webhook to Stage 1 trigger
- At 15+ clients: evaluate hiring help for call scheduling and follow-ups
- API cost tracking: log every run in Pipeline Tracker column T
