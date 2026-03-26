---
status: locked
version: 1.0
purpose: Canonical decision-logic core for Team AM engine.
governing-ai: Grok (technological architecture lead)
governing-blueprint: Client-Blueprint-12Step-Locked.md
---

# Team AM Engine Core

Version note: v1.0 – tightened thresholds and standardized formatting per Grok architecture review.

## Engine Core Purpose
This file contains only the immutable decision logic that governs how the locked 12-step Client Blueprint is interpreted, applied, and adjusted. It is the single source of truth for phase, bottleneck, weekly adjustment, consistency, safety, and override decisions. All downstream engine layers, templates, QA gates, and AI outputs must transclude or cite this file directly. No other file may redefine these rules.

## Core Decision Principles
1. Coach judgment remains supreme. The engine supplies the highest-probability recommendation based on client data; it never replaces the coach.
2. Every decision must be traceable to explicit client data or the locked blueprint.
3. Default to stability: no change unless the data earns it.
4. Prioritize simplicity and adherence over optimization.
5. All outputs must stay inside coaching scope. No diagnosis, no treatment, and no medical advice.

## Phase Assignment & Transition Logic
1. Assign exactly one current phase from the five locked options: Gain, Recomp, Fat Loss, Recovery, Health Restoration.
2. Phase assignment at blueprint creation is determined by the strongest single priority derived from client snapshot, body composition context, performance data, recovery markers, safety context, and coach assessment.
3. Use the following weighted phase-entry criteria:
   1. Gain is indicated when the primary need is muscle gain or performance support, recovery capacity is adequate, body-composition context does not make an aggressive deficit the higher priority, and no safety or restoration signals override growth-focused work.
   2. Recomp is indicated when the client likely benefits from simultaneous improvement in body composition and performance, signals do not strongly justify a dedicated gain or dedicated fat-loss phase, and adherence capacity favors a moderate, steady approach.
   3. Fat Loss is indicated when the primary need is fat reduction, body-composition context supports a deficit-driven phase, recovery capacity is sufficient to tolerate it, and no safety or restoration signals override deficit work.
   4. Recovery is indicated when the client’s primary need is to restore performance capacity, reduce overload, normalize recovery markers, or stabilize training tolerance before pursuing more aggressive body-composition or performance targets.
   5. Health Restoration is indicated when the client’s primary need is broader physiological stabilization, risk reduction, symptom management within coaching scope, or conservative support around red-flag-adjacent or medically complex circumstances.
4. Recovery or Health Restoration overrides Gain, Recomp, or Fat Loss whenever safety risk, meaningful physiological instability, or clinically-adjacent complexity makes aggressive progression inappropriate.
5. Standard phase transitions between Gain, Recomp, and Fat Loss require a minimum of three consecutive weeks of consistent contradictory evidence showing that the current phase no longer matches the client’s primary need.
6. Safety-priority transitions into Recovery or Health Restoration require either:
   1. a minimum of two consecutive weeks of consistent contradictory evidence showing the current phase is no longer appropriate, or
   2. one week containing any red-flag trigger or escalation trigger that makes continued aggressive progression inappropriate.
7. Emergency transitions may occur within-week on a single severe safety signal. In that case, aggressive progression pauses immediately and the safety and escalation logic governs the next step.
8. Once a phase is assigned, it remains stable for the full week unless a safety-priority or emergency transition is triggered.

## Week Zero Protocol
1. For new clients with no weekly data, the first blueprint is built from intake data and conservative defaults.
2. Phase assignment at Week Zero is provisional and based on stated goals, current health context, available body-composition context, recovery status, and coach judgment.
3. Calorie and macro targets default to the conservative end of the range for the assigned phase when uncertainty is meaningful.
4. Weekly adjustment logic does not activate until at least one full week of usable tracking or check-in data exists.
5. Evidence thresholds do not govern Week Zero decisions except where safety logic requires immediate escalation.
6. The first check-in prioritizes data-quality assessment first. Determine whether tracking consistency is strong enough to create usable signal before making a plan adjustment.

## Bottleneck Identification & Ranking Logic
1. Identify and name exactly three top bottlenecks only.
2. Bottleneck 1 is the strongest current limiter with the highest impact on the single priority.
3. Bottleneck 2 is the next major limiter.
4. Bottleneck 3 is the next issue worth acting on after the first two.
5. Use Do Now / Do Next / Do Later structure exclusively.
6. Bottlenecks must derive directly from Primary and Secondary Limiting Factors in Step 1 and must map to the Priority Order in Step 2 of the locked blueprint.
7. Never list more than three. Never use vague or overlapping terms.
8. When Bottleneck 1 is resolved or substantially improved, Bottleneck 2 promotes to position 1 and Bottleneck 3 promotes to position 2.
9. A new Bottleneck 3 is then identified from current data using the same bottleneck-identification logic.
10. The three-bottleneck rule is a cap, not a quota. If fewer than three meaningful bottlenecks exist, hold fewer than three and note the absence rather than inventing one.

## Weekly Adjustment Logic
1. Default action: no adjustment.
2. Perform one main adjustment only when the weekly read in Step 12 shows a clear, evidence-based need.
3. Read the week in locked order: compliance first, then food and fluids, then sleep and digestion, then performance, then bodyweight and waist.
4. Adjustment must target exactly one of the three top bottlenecks or a safety issue.
5. Adjustment must stay inside the locked 12-step shell and preserve exact field names.
6. If data is inconclusive or compliance is low, the correct adjustment is zero change plus tighter tracking unless safety logic requires otherwise.
7. Every weekly adjustment must be classifiable as one of the following categories:
   1. calorie or macro adjustment
   2. meal timing or meal-structure change
   3. supplement change
   4. hydration or electrolyte change
   5. recovery or lifestyle change
   6. training-adjacent change within coaching scope, including volume, intensity, frequency, exercise-selection emphasis, or workload management
   7. tracking-method change
   8. hold-plus-monitor, meaning an explicit no-change decision with a stated re-evaluation trigger
8. No weekly adjustment may introduce a novel adjustment category outside this menu unless the coach override logic is used and logged.
9. The Main Adjustment field in Step 12 of the locked blueprint must be selected exclusively from the defined adjustment-category menu unless Coach Override Logic is invoked.

## Cross-Step Consistency Logic
1. Step 7 must expand on, never contradict, the numeric targets established in Step 3.
2. All numeric values across Steps 3 through 8 must derive from the same estimated maintenance context and the same current phase priority.
3. Step 12 Main Adjustment must reference only data already surfaced in prior steps or in the current check-in evidence stream.
4. Any red flag in any step triggers the safety and escalation logic below.
5. Template fidelity is mandatory. Exact field names and order must be preserved in every rendered blueprint.
6. Cross-step consistency must be checked at three points:
   1. during initial blueprint generation
   2. during the QA gate before client delivery
   3. during every weekly adjustment, to ensure the new adjustment does not create a new contradiction across steps

## Evidence Standards & Thresholds
1. Bodyweight and waist trends use weekly averages only. Minimum standard: five bodyweight data points for a reliable weekly trend.
2. Performance trends use logged lifts, reps, or comparable training outputs across at least two sessions.
3. Compliance uses self-report plus tracking data. Below 80 percent overall plan compliance triggers bottleneck review before a performance-oriented adjustment is made.
4. Recovery markers such as sleep, digestion, energy, stress, and soreness use a 1 to 10 anchored scale and must be interpreted as trends, not isolated numbers.
5. Subjective-scale anchors:
   1. 1 to 3 = poor or significantly impaired
   2. 4 to 5 = below baseline or noticeably off
   3. 6 to 7 = adequate or functional
   4. 8 to 9 = good or above baseline
   5. 10 = optimal
6. No single-day outlier may drive an adjustment unless safety logic requires escalation.
7. A bodyweight or waist change must exceed normal day-to-day measurement variance and still appear in the weekly average before it is treated as a true trend. Small shifts that disappear when averaged across the week do not qualify as evidence for adjustment.
8. Evidence sensitivity is phase-specific:
   1. Recovery and Health Restoration use shorter evidence windows and give more weight to subjective-marker decline, symptom patterns, and safety context.
   2. Gain and Fat Loss use the standard thresholds above and usually require clearer multi-day or multi-session trend confirmation.
   3. Recomp uses the standard thresholds but tolerates slower visible change because progress is often harder to detect week to week.

## Safety & Escalation Logic
1. Apply the three-level framework exactly as defined in the locked blueprint.
2. Escalate immediately for any chest symptoms, severe breathlessness, dizziness or fainting, palpitations, unusual swelling, severe headaches, severe digestive symptoms, disordered-eating risk, minors, or meaningful medication, hormone, peptide, or GLP-1 complexity.
3. Treat the following as immediate-investigation thresholds even if they do not automatically force referral on their own:
   1. performance decline greater than 10 percent across two comparable sessions with no clear programming, sleep, or nutrition explanation
   2. subjective-marker decline of 3 or more points on the 1 to 10 scale within a single week
   3. bodyweight change greater than 3 percent of starting bodyweight in a single week without an intentional caloric, hydration, or training explanation
4. Sort escalation level using these rules:
   1. Continue Coaching Normally when the issue is mild, explainable, clearly resolving, and safely manageable inside normal coaching without changing the overall progression path.
   2. Coach Conservatively and Monitor Closely when the issue is persistent, worsening, partially unexplained, or involves medication complexity, vulnerability, or reduced recovery tolerance that makes normal progression less appropriate.
   3. Pause Aggressive Progression and Refer Out when the issue includes acute red-flag symptoms, meaningful deterioration beyond coaching scope, or any situation where continued aggressive coaching could plausibly worsen the client’s condition.
5. Document every escalation decision in the internal record trail with date, data trigger, level chosen, and next-week confirmation signal.

## Coach Override Logic
1. Coach may override any engine recommendation.
2. Every override must be logged with:
   1. what the engine would have done
   2. what the coach changed
   3. the explicit reason for override
   4. one measurable signal to confirm or disprove the override next week
3. Overrides do not alter the locked blueprint shell or field names.

## Explicit Boundaries (What the Engine Does Not Contain)
1. Intake procedures or client questionnaires
2. Visual design or Obsidian vault instructions
3. Prompt templates or AI instructions
4. Automation scripts or code
5. Reference standards, PDFs, or external documents
6. Any medical diagnosis, treatment plan, or clinical advice
