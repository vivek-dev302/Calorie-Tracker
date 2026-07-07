const User = require('../models/User');

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightMeters = heightCm / 100;
  return round(weightKg / (heightMeters * heightMeters), 1);
}

function calculateBMR(weightKg, heightCm, age, gender) {
  if (!weightKg || !heightCm || !age || !gender) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return round(gender === 'female' ? base - 161 : base + 5, 0);
}

// Macro splits by goal: [proteinPct, carbsPct, fatPct]
// lose:     high protein to preserve muscle during deficit
// maintain: balanced general-purpose split
// gain:     higher carbs to fuel training, moderate protein for muscle growth
const MACRO_SPLITS = {
  lose:     { protein: 0.35, carbs: 0.35, fat: 0.30 },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  gain:     { protein: 0.30, carbs: 0.45, fat: 0.25 },
};

// Minimum safe calories by gender (evidence-based clinical thresholds)
const MIN_CALORIES = { male: 1500, female: 1200 };

// Default weekly rate when goal is lose/gain but rate is unset (0.25 kg/week = ~275 kcal/day)
const DEFAULT_WEEKLY_RATE_KG = 0.25;

function calculateDailyGoals(profile) {
  const { weightKg, heightCm, age, gender, activityLevel, goalType, weeklyGoalRateKg } = profile || {};

  const warnings = [];
  const bmi = calculateBMI(weightKg, heightCm);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);

  if (!bmr) {
    return {
      bmi,
      bmr: null,
      tdee: null,
      targetCalories: null,
      waterMl: null,
      macros: null,
      warnings,
      isComplete: false,
    };
  }

  // Activity level — warn if missing, fall back to sedentary
  if (!activityLevel || !ACTIVITY_MULTIPLIERS[activityLevel]) {
    warnings.push('Activity level not set — using sedentary as default.');
  }
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.sedentary;
  const tdee = round(bmr * multiplier, 0);

  // Weekly rate — use default when goal requires a deficit/surplus but rate is 0 or unset
  const effectiveGoal = goalType || 'maintain';
  let effectiveRate = weeklyGoalRateKg || 0;

  if ((effectiveGoal === 'lose' || effectiveGoal === 'gain') && effectiveRate === 0) {
    effectiveRate = DEFAULT_WEEKLY_RATE_KG;
    warnings.push(`Weekly goal rate not set — using ${DEFAULT_WEEKLY_RATE_KG} kg/week as default.`);
  }

  // Clamp rate to safe range (0–1 kg/week) regardless of what's stored
  effectiveRate = Math.min(Math.max(effectiveRate, 0), 1);

  const dailyAdjustment = round((effectiveRate * 7700) / 7, 0);
  let targetCalories = tdee;
  if (effectiveGoal === 'lose') targetCalories = tdee - dailyAdjustment;
  if (effectiveGoal === 'gain') targetCalories = tdee + dailyAdjustment;

  // Gender-aware calorie floor
  const calorieFloor = MIN_CALORIES[gender] ?? MIN_CALORIES.female;
  if (targetCalories < calorieFloor) {
    warnings.push(`Target calories were below the safe minimum (${calorieFloor} kcal) and have been adjusted.`);
  }
  const safeCalories = Math.max(calorieFloor, targetCalories);

  const waterMl = weightKg ? round(weightKg * 35, 0) : null;

  // Goal-aware macro split
  const split = MACRO_SPLITS[effectiveGoal] ?? MACRO_SPLITS.maintain;

  return {
    bmi,
    bmr,
    tdee,
    targetCalories: safeCalories,
    waterMl,
    macros: {
      proteinGrams: round((safeCalories * split.protein) / 4, 0),
      carbsGrams:   round((safeCalories * split.carbs)   / 4, 0),
      fatsGrams:    round((safeCalories * split.fat)     / 9, 0),
    },
    warnings,
    isComplete: true,
  };
}

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId).select('name email avatar profile');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        profile: user.profile || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const allowedFields = [
      'heightCm',
      'weightKg',
      'age',
      'gender',
      'activityLevel',
      'goalType',
      'weeklyGoalRateKg',
      'targetWeightKg',
      'unitSystem',
    ];

    const profileUpdates = {};
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        profileUpdates[`profile.${field}`] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: profileUpdates },
      { new: true, runValidators: true }
    ).select('name email avatar profile');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        profile: user.profile || {},
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

async function getDailyGoals(req, res) {
  try {
    const user = await User.findById(req.user.userId).select('profile');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const goals = calculateDailyGoals(user.profile || {});

    return res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getDailyGoals,
};
