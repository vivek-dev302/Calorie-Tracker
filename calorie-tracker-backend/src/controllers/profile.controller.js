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

function calculateDailyGoals(profile) {
  const { weightKg, heightCm, age, gender, activityLevel, goalType, weeklyGoalRateKg } = profile || {};

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
      isComplete: false,
    };
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.sedentary;
  const tdee = round(bmr * multiplier, 0);

  const dailyAdjustment = round(((weeklyGoalRateKg || 0) * 7700) / 7, 0);
  let targetCalories = tdee;

  if (goalType === 'lose') targetCalories = tdee - dailyAdjustment;
  if (goalType === 'gain') targetCalories = tdee + dailyAdjustment;

  const safeCalories = Math.max(1200, targetCalories);
  const waterMl = weightKg ? round(weightKg * 35, 0) : null;

  return {
    bmi,
    bmr,
    tdee,
    targetCalories: safeCalories,
    waterMl,
    macros: {
      proteinGrams: round((safeCalories * 0.3) / 4, 0),
      carbsGrams: round((safeCalories * 0.4) / 4, 0),
      fatsGrams: round((safeCalories * 0.3) / 9, 0),
    },
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
