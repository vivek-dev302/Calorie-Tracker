const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: String,
    googleId: { type: String, required: true, unique: true },
    profile: {
      heightCm: { type: Number, min: 80, max: 250 },
      weightKg: { type: Number, min: 25, max: 300 },
      age: { type: Number, min: 10, max: 100 },
      gender: { type: String, enum: ['male', 'female'], default: 'male' },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
        default: 'sedentary',
      },
      goalType: {
        type: String,
        enum: ['lose', 'maintain', 'gain'],
        default: 'maintain',
      },
      weeklyGoalRateKg: { type: Number, min: 0, max: 1, default: 0 },
      targetWeightKg: { type: Number, min: 25, max: 300 },
      unitSystem: { type: String, enum: ['metric'], default: 'metric' },
    },
  },
  { timestamps: true }
);

const User =  mongoose.model('User', userSchema);
module.exports = User;
