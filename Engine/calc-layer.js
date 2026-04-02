'use strict';

// ============================================================
// TEAM AM — DETERMINISTIC CALCULATION LAYER
// Knowledge Base v2.0
//
// PURPOSE:
//   Pre-computes ALL numerical coaching targets from verified
//   client data. Eliminates LLM arithmetic from the pipeline.
//   Stage 2 receives these as locked constants.
//
// USAGE (Node.js):
//   const { computeTargets, buildStage2Injection } = require('./calc-layer');
//   const result = computeTargets(clientData);
//   const injection = buildStage2Injection(result);
//
// STANDALONE TEST:
//   node Engine/calc-layer.js
// ============================================================

const KB_VERSION = '2.0';

// ============================================================
// CONSTANTS
// ============================================================

const ACTIVITY_MULTIPLIERS = {
  sedentary:        1.2,
  lightly_active:   1.375,
  moderate:         1.55,
  very_active:      1.725,
  extremely_active: 1.9
};

const PROTEIN_RATIO = {
  fat_loss:    0.8,
  maintenance: 0.8,
  muscle_gain: 1.0,
  recomp:      1.0
};

const FAT_RATIO            = 0.4;
const MIN_CALORIES         = { male: 1500, female: 1200 };
const GLP1_MIN_CALORIES    = { male: 1800, female: 1500 };
const GLP1_MAX_DEFICIT     = 300;
const CREATINE_RATIO       = 0.06;   // g per lb bodyweight
const CREATINE_FLAG_THRESHOLD = 15;  // g/day
const CARBS_LOW_FLAG       = 100;    // g/day

const SWEAT_ADDITIONS = {
  light:    15,
  moderate: 21,
  heavy:    28
};

// ============================================================
// computeTargets(input) → output
//
// input shape:
//   { client_name, sex, age, weight_lbs, height_inches,
//     body_fat_percent, activity_level, training_days_per_week,
//     phase, supplement_tier, sweat_level, sleep_hours_current,
//     glp1, pregnant_or_postpartum, digestion_score }
// ============================================================

function computeTargets(input) {
  const flags    = [];
  const warnings = [];

  // ---- STEP 1: CONVERSIONS -----------------------------------
  const weight_kg = _round2(input.weight_lbs / 2.205);
  const height_cm = _round2(input.height_inches * 2.54);

  // ---- STEP 2: BMR (Mifflin-St Jeor) -------------------------
  const sex     = (input.sex || 'male').toLowerCase();
  const sexAdj  = sex === 'male' ? 5 : -161;
  const bmr_raw = (10 * weight_kg) + (6.25 * height_cm) - (5 * input.age) + sexAdj;
  const bmr     = Math.round(bmr_raw);

  // ---- STEP 3: TDEE -------------------------------------------
  const activityKey  = (input.activity_level || 'moderate').toLowerCase();
  const multiplier   = ACTIVITY_MULTIPLIERS[activityKey] || 1.55;
  const tdee_raw     = bmr_raw * multiplier;
  const tdee_maintenance = _roundTo(tdee_raw, 50);

  if (multiplier >= 1.725) warnings.push('HIGH_ACTIVITY_MULTIPLIER');

  // ---- STEP 4: DAILY CALORIES ---------------------------------
  const phase = (input.phase || 'fat_loss').toLowerCase();
  const glp1  = !!input.glp1;
  let deficit_amount = 0;
  let daily_calories;

  switch (phase) {
    case 'fat_loss':
      deficit_amount = glp1 ? GLP1_MAX_DEFICIT : 400;
      daily_calories = tdee_maintenance - deficit_amount;
      if (glp1) flags.push('GLP1_CONSERVATIVE_DEFICIT');
      break;
    case 'maintenance':
      deficit_amount = 0;
      daily_calories = tdee_maintenance;
      break;
    case 'muscle_gain':
      deficit_amount = -300; // negative = surplus
      daily_calories = tdee_maintenance + 300;
      break;
    case 'recomp':
      deficit_amount = 100;
      daily_calories = tdee_maintenance - 100;
      break;
    default:
      deficit_amount = 400;
      daily_calories = tdee_maintenance - 400;
  }

  const floor       = MIN_CALORIES[sex]     || 1500;
  const glp1_floor  = GLP1_MIN_CALORIES[sex] || 1800;

  const below_minimum_floor = daily_calories < floor;
  if (below_minimum_floor) {
    flags.push('CALORIE_BELOW_FLOOR');
    daily_calories = floor;
  } else if (daily_calories < floor + 100) {
    warnings.push('NEAR_MINIMUM_FLOOR');
  }

  if (glp1 && daily_calories < glp1_floor) {
    flags.push('GLP1_BELOW_RECOMMENDED_FLOOR');
  }

  // ---- STEP 4a: BODYWEIGHT OUTLIER ----------------------------
  // Use adjusted bodyweight for extreme weights (>275 or <110 lbs)
  let effective_weight = input.weight_lbs;
  let bodyweight_outlier = false;

  if (input.weight_lbs > 275 || input.weight_lbs < 110) {
    bodyweight_outlier = true;
    flags.push('BODYWEIGHT_OUTLIER');
    // Robinson formula for ideal body weight
    const ibw_kg = sex === 'male'
      ? 52 + 1.9 * (input.height_inches - 60)
      : 49 + 1.7 * (input.height_inches - 60);
    const ibw_lbs = ibw_kg * 2.205;
    effective_weight = Math.round(ibw_lbs + 0.25 * (input.weight_lbs - ibw_lbs));
  }

  // ---- STEP 5: MACROS -----------------------------------------
  let protein_ratio = PROTEIN_RATIO[phase] || 0.8;
  if (glp1 && protein_ratio < 1.0) protein_ratio = 1.0; // GLP-1: minimum 1.0g/lb

  const protein_grams = Math.round(effective_weight * protein_ratio);
  const fat_grams     = Math.round(effective_weight * FAT_RATIO);

  const protein_cals  = protein_grams * 4;
  const fat_cals      = fat_grams * 9;
  const carb_cals     = daily_calories - protein_cals - fat_cals;
  const carb_grams    = Math.round(carb_cals / 4);

  if (carb_grams < CARBS_LOW_FLAG) flags.push('CARBS_BELOW_100');

  // Verify macro sum (rounding can cause ±1-5 kcal variance — that's normal)
  const macro_calorie_check    = (protein_grams * 4) + (carb_grams * 4) + (fat_grams * 9);
  const macro_calorie_variance = Math.abs(macro_calorie_check - daily_calories);
  const variance_acceptable    = macro_calorie_variance <= 5;
  if (!variance_acceptable) flags.push('MACRO_VARIANCE_HIGH');

  // Fiber: default 30g; reduce to 25g if poor digestion
  const digestion_score = input.digestion_score || 7;
  const fiber_grams = digestion_score <= 4 ? 25 : 30;

  // ---- STEP 6: FLUIDS -----------------------------------------
  const base_fluid_oz          = _roundTo(input.weight_lbs * (2 / 3), 5);
  const training_day_fluid_oz  = base_fluid_oz + 32;
  const sweat_level            = (input.sweat_level || 'moderate').toLowerCase();
  const sweat_addition_oz      = SWEAT_ADDITIONS[sweat_level] || 21;

  // ---- STEP 7: ELECTROLYTES -----------------------------------
  // Sodium calculated from BASE (non-training-day) fluid for reference target
  const fluid_liters  = _round2(base_fluid_oz / 33.814);
  const sodium_mg     = _roundTo(fluid_liters * 1000, 50);
  const potassium_mg  = sodium_mg;

  // ---- STEP 8: CREATINE ---------------------------------------
  const creatine_raw     = input.weight_lbs * CREATINE_RATIO;
  const creatine_rounded = _roundTo(creatine_raw, 0.5);
  const creatine_exceeds_15g = creatine_rounded > CREATINE_FLAG_THRESHOLD;
  if (creatine_exceeds_15g) flags.push('CREATINE_ABOVE_15G');

  // ---- STEPS 9-11: RECOVERY CONSTANTS -----------------------
  const sleep_target_hours  = sex === 'male' ? '7.5-8' : '8-9';
  const daily_steps         = 10000;
  const caffeine_cutoff_hours = 8;

  // ---- ASSEMBLE OUTPUT ----------------------------------------
  return {
    computed_at:  new Date().toISOString(),
    kb_version:   KB_VERSION,

    input_summary: {
      client_name:           input.client_name,
      sex,
      age:                   input.age,
      weight_lbs:            input.weight_lbs,
      height_inches:         input.height_inches,
      activity_level:        activityKey,
      phase,
      glp1,
      sweat_level,
      training_days_per_week: input.training_days_per_week || 0
    },

    conversions: {
      weight_kg,
      height_cm
    },

    energy: {
      bmr,
      tdee_maintenance,
      tdee_raw:            Math.round(tdee_raw),
      daily_calories,
      deficit_amount,
      below_minimum_floor
    },

    macros: {
      effective_weight_lbs: effective_weight,
      bodyweight_outlier,
      protein_grams,
      protein_ratio,
      fat_grams,
      fat_ratio:            FAT_RATIO,
      carb_grams,
      fiber_grams,
      macro_calorie_check,
      macro_calorie_variance,
      variance_acceptable
    },

    hydration: {
      base_fluid_oz,
      training_day_fluid_oz,
      sweat_addition_oz,
      fluid_liters,
      sodium_mg,
      potassium_mg
    },

    supplements: {
      creatine_raw:      _round2(creatine_raw),
      creatine_rounded,
      creatine_exceeds_15g
    },

    recovery: {
      sleep_target_hours,
      daily_steps,
      caffeine_cutoff_hours
    },

    flags,
    warnings
  };
}

// ============================================================
// buildStage2Injection(computed) → string
//
// Builds the pre-computed targets block prepended to Stage 2.
// ============================================================

function buildStage2Injection(c) {
  const e = c.energy;
  const m = c.macros;
  const h = c.hydration;
  const s = c.supplements;
  const r = c.recovery;

  const flagLine = c.flags.length    > 0 ? c.flags.join(', ')    : 'None';
  const warnLine = c.warnings.length > 0 ? c.warnings.join(', ') : 'None';

  // Deficit phrasing: surplus for muscle gain
  const deficitLabel = e.deficit_amount < 0
    ? `${Math.abs(e.deficit_amount)} calorie SURPLUS above maintenance`
    : `${e.deficit_amount} calories below maintenance`;

  return [
    '## PRE-COMPUTED TARGETS (VERIFIED — DO NOT RECALCULATE)',
    '',
    `The following values were calculated using Team AM Knowledge Base v${c.kb_version}.`,
    'Use these EXACT numbers in the blueprint. Do not recalculate, round differently,',
    'or substitute your own estimates.',
    '',
    `Daily Calories: ${e.daily_calories}`,
    `Maintenance Estimate: ${e.tdee_maintenance}`,
    `Deficit: ${deficitLabel}`,
    '',
    `Protein: ${m.protein_grams}g (${m.protein_ratio}g/lb)`,
    `Carbs: ${m.carb_grams}g`,
    `Fat: ${m.fat_grams}g (${m.fat_ratio}g/lb)`,
    `Fiber: ${m.fiber_grams}g`,
    '',
    `Fluids: ${h.base_fluid_oz} oz (base) / ${h.training_day_fluid_oz} oz (training days)`,
    `Sodium: ${h.sodium_mg}mg (1g per liter of ${h.fluid_liters}L daily water)`,
    `Potassium: ${h.potassium_mg}mg (matches sodium 1:1)`,
    '',
    `Creatine: ${s.creatine_rounded}g/day (0.06g × ${c.input_summary.weight_lbs} lbs)`,
    `Sleep: ${r.sleep_target_hours} hours`,
    `Steps: ${r.daily_steps}/day`,
    `Caffeine cutoff: ${r.caffeine_cutoff_hours} hours before bed`,
    '',
    `Flags: ${flagLine}`,
    `Warnings: ${warnLine}`,
    '',
    '---'
  ].join('\n');
}

// ============================================================
// HELPERS
// ============================================================

function _round2(n)          { return Math.round(n * 100) / 100; }
function _roundTo(n, factor) { return Math.round(n / factor) * factor; }

// ============================================================
// TEST CASES
// ============================================================

const TEST_CASES = [
  {
    label: 'Test 1 — Jordan Rivera (standard male, fat loss)',
    input: {
      client_name: 'Jordan Rivera',
      sex: 'male', age: 28, weight_lbs: 195, height_inches: 71,
      body_fat_percent: 22, activity_level: 'moderate',
      training_days_per_week: 4, phase: 'fat_loss',
      supplement_tier: 'basic', sweat_level: 'moderate',
      sleep_hours_current: 7.5, glp1: false,
      pregnant_or_postpartum: false
    }
  },
  {
    label: 'Test 2 — Female client (fat loss)',
    input: {
      client_name: 'Alex Chen',
      sex: 'female', age: 32, weight_lbs: 140, height_inches: 64,
      body_fat_percent: 28, activity_level: 'lightly_active',
      training_days_per_week: 3, phase: 'fat_loss',
      supplement_tier: 'basic', sweat_level: 'moderate',
      sleep_hours_current: 7.0, glp1: false,
      pregnant_or_postpartum: false
    }
  },
  {
    label: 'Test 3 — Heavy client 310 lbs (outlier → adjusted BW)',
    input: {
      client_name: 'Marcus Williams',
      sex: 'male', age: 45, weight_lbs: 310, height_inches: 72,
      body_fat_percent: 38, activity_level: 'sedentary',
      training_days_per_week: 0, phase: 'fat_loss',
      supplement_tier: 'basic', sweat_level: 'heavy',
      sleep_hours_current: 6.5, glp1: false,
      pregnant_or_postpartum: false
    }
  },
  {
    label: 'Test 4 — GLP-1 client (conservative deficit + higher protein)',
    input: {
      client_name: 'Sam Torres',
      sex: 'male', age: 38, weight_lbs: 220, height_inches: 68,
      body_fat_percent: 30, activity_level: 'moderate',
      training_days_per_week: 3, phase: 'fat_loss',
      supplement_tier: 'basic', sweat_level: 'moderate',
      sleep_hours_current: 7.0, glp1: true,
      medications: ['semaglutide'], pregnant_or_postpartum: false
    }
  },
  {
    label: 'Test 5 — Lightweight female 105 lbs (outlier, muscle gain)',
    input: {
      client_name: 'Mia Park',
      sex: 'female', age: 22, weight_lbs: 105, height_inches: 62,
      body_fat_percent: 20, activity_level: 'very_active',
      training_days_per_week: 5, phase: 'muscle_gain',
      supplement_tier: 'basic', sweat_level: 'light',
      sleep_hours_current: 8.0, glp1: false,
      pregnant_or_postpartum: false
    }
  }
];

// ============================================================
// STANDALONE TEST RUNNER
// ============================================================

/* istanbul ignore next */
if (require.main === module) {
  const LINE = '='.repeat(62);
  const DIV  = '-'.repeat(62);

  console.log(LINE);
  console.log('  TEAM AM — CALC LAYER TEST RUN (KB v' + KB_VERSION + ')');
  console.log(LINE);

  let allPassed = true;

  TEST_CASES.forEach((tc, idx) => {
    console.log('\n' + DIV);
    console.log('  ' + tc.label);
    console.log(DIV);

    const r = computeTargets(tc.input);
    const e = r.energy;
    const m = r.macros;
    const h = r.hydration;
    const s = r.supplements;
    const rec = r.recovery;

    const pass = m.variance_acceptable;
    if (!pass) allPassed = false;

    console.log(`  BMR:              ${e.bmr} kcal`);
    console.log(`  TDEE (rounded):   ${e.tdee_maintenance} kcal`);
    console.log(`  Daily calories:   ${e.daily_calories} kcal`);
    if (m.bodyweight_outlier) {
      console.log(`  Effective weight: ${m.effective_weight_lbs} lbs  [outlier adj from ${tc.input.weight_lbs}]`);
    }
    console.log(`  Protein:          ${m.protein_grams}g  (${m.protein_ratio}g/lb × ${m.effective_weight_lbs} lbs)`);
    console.log(`  Carbs:            ${m.carb_grams}g`);
    console.log(`  Fat:              ${m.fat_grams}g  (${m.fat_ratio}g/lb)`);
    console.log(`  Fiber:            ${m.fiber_grams}g`);
    console.log(`  Macro check:      P${m.protein_grams}×4 + C${m.carb_grams}×4 + F${m.fat_grams}×9 = ${m.macro_calorie_check} kcal  (Δ${m.macro_calorie_variance}) ${pass ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Base fluids:      ${h.base_fluid_oz} oz`);
    console.log(`  Training day:     ${h.training_day_fluid_oz} oz  (+32 exercise)`);
    console.log(`  Sweat addition:   +${h.sweat_addition_oz} oz  (${r.input_summary.sweat_level})`);
    console.log(`  Sodium:           ${h.sodium_mg} mg`);
    console.log(`  Potassium:        ${h.potassium_mg} mg`);
    console.log(`  Creatine:         ${s.creatine_rounded} g/day`);
    console.log(`  Sleep target:     ${rec.sleep_target_hours} hrs`);
    console.log(`  Flags:            ${r.flags.length    > 0 ? r.flags.join(', ')    : 'None'}`);
    console.log(`  Warnings:         ${r.warnings.length > 0 ? r.warnings.join(', ') : 'None'}`);

    // Print Stage 2 injection for first test only
    if (idx === 0) {
      console.log('\n--- Stage 2 injection preview ---');
      console.log(buildStage2Injection(r));
    }
  });

  console.log('\n' + LINE);
  console.log(allPassed
    ? '  ALL MACRO VARIANCE CHECKS PASSED'
    : '  ONE OR MORE MACRO VARIANCE CHECKS FAILED — review above');
  console.log(LINE + '\n');
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = { computeTargets, buildStage2Injection };
