# Client Blueprint Pipeline Checklist

## Client Info
- Name:
- Tier:
- Start Date:
- Goal:

## Pre-Pipeline
- [ ] Intake form submitted and data in Google Sheets
- [ ] Onboarding call completed
- [ ] Call notes written in detail
- [ ] Activity level confirmed (sedentary/light/moderate/very active)
- [ ] Any red flags addressed (medical conditions, ED screening, GLP-1, injuries)
- [ ] Coaching brief created with volume directive (1-3 sets per exercise)

## Pipeline Execution
- [ ] Stage 1: Pre-Call Analysis run
- [ ] Stage 1.5: Call Notes Integration run
- [ ] Calc Layer run and verified (BMR, TDEE, target calories, macros, fluid, sodium, potassium, creatine)
- [ ] Verify calc layer numbers make sense (sanity check: is TDEE reasonable for their activity level?)
- [ ] Stage 2: Blueprint Generation run (Opus, ~$1.25)
- [ ] cleanup-text.js run (--tier standard for most clients, --tier essential for beginners)
- [ ] verify-numbers.js run and PASS
- [ ] Stage 3: QA Gate run (Sonnet, 37 checks)
- [ ] Review QA report: 0 BLOCKs required before proceeding
- [ ] Resolve any WARNs

## Coach Review (YOU, not the AI)
- [ ] Read the full blueprint start to finish
- [ ] Does Step 01 prove you listened? Are their specific details reflected?
- [ ] Are the numbers correct? (calories, macros, fluid targets, supplement doses)
- [ ] Is the training program appropriate for their experience level and equipment?
- [ ] Does the meal structure fit their actual schedule?
- [ ] Is the voice consistent? Does it sound like Alejandro, not a chatbot?
- [ ] Would you be proud to send this? If not, what needs to change?

## Post-Pipeline
- [ ] Export to PDF (Cmd+P, margins none, background graphics on)
- [ ] Final visual check of PDF (no broken layouts, no missing sections)
- [ ] Send via iMessage with personal message
- [ ] Log the client in your tracking system (Google Sheet or Notion)
- [ ] Set calendar reminder for Day 14 check-in
- [ ] API cost logged (track spend per client)
