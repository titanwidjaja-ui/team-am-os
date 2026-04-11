# Intake Form v2.0 — QID Reference Map

Form ID: 260871732972162
Form URL: https://form.jotform.com/260871732972162
Rebuilt: 2026-04-04

## Complete QID Map

### Hidden Metadata Fields
| QID | Name | Purpose |
|-----|------|---------|
| 203 | formVersion | Default "v2.0" |
| 204 | submissionTimestamp | Auto-populated |
| 205 | complexityScore | Computed post-submit |
| 206 | redFlagCount | Computed post-submit |
| 207 | tierClassification | Computed post-submit |
| 208 | readinessScoreHidden | Computed post-submit |

### Section Headers (control_head)
| QID | Name | Text |
|-----|------|------|
| 209 | welcomeHead | Let's Build Your Plan |
| 213 | goalsHeader | Great. Now tell me what you're here for. |
| 221 | bodyTrainingHeader | Now let's understand where your body and training are at. |
| 237 | nutritionHeader | A few questions about how you eat. No judgment, just context. |
| 246 | healthHeader | Almost done. A few health questions so we can keep you safe. |
| 261 | lifestyleHeader | Last section. Tell me about your day-to-day. |
| 268 | femaleHeader | A few more questions that help us account for your hormonal health. [HIDDEN - Gate 7] |
| 276 | coachingHeader | You're almost done. Choose the coaching tier that fits you best. |

### Section 1: About You
| QID | Name | Type | Required |
|-----|------|------|----------|
| 210 | fullName | control_fullname | Yes |
| 211 | email | control_email | Yes |
| 212 | phone | control_phone | Yes |

> **QID 211 description:** "Used for account and billing purposes only. Your blueprint is delivered via iMessage."

### Section 2: Your Goals
| QID | Name | Type | Required | Hidden |
|-----|------|------|----------|--------|
| 214 | primaryGoal | control_radio | Yes | |
| 215 | goalDescription | control_textarea | Yes | |
| 216 | whyNow | control_textarea | Yes | |
| 217 | hasDeadline | control_radio | | |
| 218 | deadlineDate | control_datetime | | Yes (Deadline Gate) |
| 219 | deadlineEvent | control_textbox | | Yes (Deadline Gate) |
| 220 | previousAttempts | control_textarea | Yes | |

> **QID 214 options:** Fat loss, Muscle gain, Body recomposition, General health and performance

### Section 3: Your Body and Training
| QID | Name | Type | Required | Hidden |
|-----|------|------|----------|--------|
| 222 | age | control_number | Yes | |
| 223 | biologicalSex | control_radio | Yes | |
| 224 | heightFt | control_number | Yes | |
| 225 | heightIn | control_number | Yes | |
| 226 | weightLbs | control_number | Yes | |
| 227 | bodyFatEstimate | control_radio | Yes | |
| 228 | trainingExperience | control_radio | Yes | |
| 229 | trainingSplit | control_radio | | Yes (Gate 1) |
| 230 | benchWeight | control_textbox | | Yes (Gate 1) |
| 231 | squatWeight | control_textbox | | Yes (Gate 1) |
| 232 | deadliftWeight | control_textbox | | Yes (Gate 1) |
| 233 | ohpWeight | control_textbox | | Yes (Gate 1) |
| 234 | trainingDays | control_radio | Yes | |
| 235 | trainingTime | control_radio | Yes | |
| 236 | trainingLocation | control_radio | Yes | |
| 291 | dailySteps | control_radio | Yes | |
| 292 | occupation | control_textbox | Yes | |

> **QID 291 options:** Under 3,000 / 3,000-5,000 / 5,000-8,000 / 8,000-10,000 / 10,000-15,000 / 15,000+

> **QID 227 options:** Under 10%, 10-12%, 13-15%, 16-18%, 19-22%, 23-26%, 27-30%, 31-35%, 36%+, Not sure

### Section 4: How You Eat
| QID | Name | Type | Required | Hidden |
|-----|------|------|----------|--------|
| 238 | foodRecall | control_textarea | Yes | |
| 239 | cookingComfort | control_radio | Yes | |
| 240 | foodRestrictions | control_checkbox | Yes | |
| 293 | eatingSchedule | control_radio | Yes | |
| 294 | eatingWindow | control_textbox | | Yes (Eating Schedule Gate) |
| 241 | nutritionSophistication | control_radio | Yes | |
| 242 | knowsMaintenance | control_radio | | Yes (Gate 6) |
| 243 | maintenanceCalories | control_number | | Yes (Gate 6) |
| 244 | weekendEating | control_textarea | | Yes (Gate 6) |
| 295 | dailyWaterIntake | control_radio | Yes | |
| 245 | alcoholFrequency | control_radio | Yes | |
| 296 | currentSupplements | control_textarea | No | |

> **QID 293 options:** No set schedule, I eat when hungry / I eat at roughly the same times each day / I practice intermittent fasting / I fast for religious reasons / Other
> **QID 295 options:** Less than 40oz / 40-60oz / 60-80oz / 80-100oz / 100-130oz / More than 130oz / I don't track

### Section 5: Your Health
| QID | Name | Type | Required | Hidden |
|-----|------|------|----------|--------|
| 247 | hasMedicalConditions | control_radio | Yes | |
| 248 | medicalConditionsList | control_checkbox | | Yes (Gate 2) |
| 249 | medicationsText | control_textarea | | Yes (Gate 2) |
| 250 | weightLossMedication | control_radio | Yes | |
| 297 | glp1MedicationName | control_textbox | | Yes (Gate 3) |
| 298 | glp1CurrentDose | control_textbox | | Yes (Gate 3) |
| 251 | glp1Duration | control_radio | | Yes (Gate 3) |
| 252 | glp1GiEffects | control_radio | | Yes (Gate 3) |
| 253 | hasInjuries | control_radio | Yes | |
| 254 | injuryDescription | control_textarea | | Yes (Injury Gate) |
| 255 | foodRelationship | control_radio | Yes | |
| 256 | scoff1 | control_radio | | Yes (Gate 4) |
| 257 | scoff2 | control_radio | | Yes (Gate 4) |
| 258 | scoff3 | control_radio | | Yes (Gate 4) |
| 259 | scoff4 | control_radio | | Yes (Gate 4) |
| 260 | scoff5 | control_radio | | Yes (Gate 4) |

### Section 6: Your Lifestyle
| QID | Name | Type | Required |
|-----|------|------|----------|
| 262 | sleepHours | control_radio | Yes |
| 263 | sleepQuality | control_scale (1-10) | Yes |
| 264 | stressScore | control_scale (1-10) | Yes |
| 265 | stressSource | control_textbox | |
| 266 | homeEnvironment | control_textbox | Yes |
| 267 | readinessScore | control_scale (1-10) | Yes |

### Section 7: Female-Specific (Gate 7)
| QID | Name | Type | Hidden |
|-----|------|------|--------|
| 269 | menstrualRegularity | control_radio | Yes |
| 270 | pregnancyStatus | control_radio | Yes |
| 271 | menopauseStatus | control_radio | Yes |

### Section 8: Goal-Specific (Gate 8)
| QID | Name | Type | Hidden |
|-----|------|------|--------|
| 272 | weightLossHistory | control_textarea | Yes (Gate 8a: Fat loss) |
| 273 | goalWeight | control_textbox | Yes (Gate 8a: Fat loss) |
| 274 | musclePriorities | control_checkbox | Yes (Gate 8b: Muscle gain) |
| 275 | surplusComfort | control_radio | Yes (Gate 8b: Muscle gain) |

### Section 9: Coaching Preferences
| QID | Name | Type | Required |
|-----|------|------|----------|
| 277 | coachingStyle | control_radio | Yes |
| 278 | callPreference | control_radio | Yes |
| 279 | anythingElse | control_textarea | |

### Section 10: Pricing + Confirmation
| QID | Name | Type | Required |
|-----|------|------|----------|
| 280 | selectedTier | control_radio | Yes |
| 281 | confirmationFlag | control_checkbox | Yes |

## Conditional Logic (12 Rules)

| Rule | Gate | Trigger Field (QID) | Condition | Shows (QIDs) |
|------|------|---------------------|-----------|---------------|
| 1 | Deadline | hasDeadline (217) | equals "Yes" | deadlineDate (218), deadlineEvent (219) |
| 2 | Gate 1 | trainingExperience (228) | notEquals "Less than 6 months" | trainingSplit (229), benchWeight (230), squatWeight (231), deadliftWeight (232), ohpWeight (233) |
| 3 | Gate 2 | hasMedicalConditions (247) | equals "Yes" | medicalConditionsList (248), medicationsText (249) |
| 4 | Gate 3 | weightLossMedication (250) | equals "Yes, GLP-1..." | glp1MedicationName (297), glp1CurrentDose (298), glp1Duration (251), glp1GiEffects (252) |
| 5 | Injury | hasInjuries (253) | equals "Yes" | injuryDescription (254) |
| 6 | Gate 4 | foodRelationship (255) | equals "Yes, significantly" | scoff1-5 (256-260) |
| 7 | Gate 6 | nutritionSophistication (241) | equals "tracked macros" OR "nutrition coach" | knowsMaintenance (242), maintenanceCalories (243), weekendEating (244) |
| 8 | Gate 7 | biologicalSex (223) | equals "Female" | femaleHeader (268), menstrualRegularity (269), pregnancyStatus (270), menopauseStatus (271) |
| 9 | Gate 8a | primaryGoal (214) | equals "Fat loss" | weightLossHistory (272), goalWeight (273) |
| 10 | Gate 8b | primaryGoal (214) | equals "Muscle gain" | musclePriorities (274), surplusComfort (275) |
| 11 | Eating Schedule | eatingSchedule (293) | equals "I practice intermittent fasting" OR "I fast for religious reasons" | eatingWindow (294) |
| 12 | Gate 3 (extended) | weightLossMedication (250) | equals "Yes, GLP-1..." | glp1MedicationName (297), glp1CurrentDose (298) |

### Section 11: Coaching Agreement & Disclaimer
| QID | Name | Type | Required |
|-----|------|------|----------|
| 289 | coachingDisclaimer | control_text | — |
| 290 | disclaimerAgreement | control_checkbox | Yes |

## Implementation Notes
- All 12 conditional gates are active with explicit show/hide clauses (34 rules total) for Jotform Card Layout compatibility
- Coupon codes (TAMFAM26, TEAMAM10, TEAMAM20) are configured as Stripe Coupon IDs, not Promotion Codes
- Post-submit redirect set to https://teamamtraining.com/thankyou

## Stats
- Total questions: 89
- Required fields: 42
- Hidden/conditional fields: 31
- Conditional rules: 12
- Sections: 11 + welcome card
- Interstitial headers: 8
