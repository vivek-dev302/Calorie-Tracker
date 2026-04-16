export type UserProfile = {
  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goalType?: 'lose' | 'maintain' | 'gain';
  weeklyGoalRateKg?: number;
  targetWeightKg?: number;
  unitSystem?: 'metric';
};

export type ProfileResponse = {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  profile: UserProfile;
};

export type DailyGoals = {
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  targetCalories: number | null;
  waterMl: number | null;
  macros: {
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
  } | null;
  isComplete: boolean;
};
