// TDEE Calculator - Total Daily Energy Expenditure

export interface UserProfile {
  gender: 'male' | 'female';
  age: number;
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Calculate BMR using Mifflin-St Jeor Equation
export function calculateBMR(gender: string, age: number, height: number, weight: number): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Activity multipliers
const activityMultipliers = {
  sedentary: 1.2,      // 久坐（辦公室工作）
  light: 1.375,        // 輕度活動（每週運動1-3天）
  moderate: 1.55,      // 中度活動（每週運動3-5天）
  active: 1.725,       // 高度活動（每週運動6-7天）
  very_active: 1.9     // 非常活躍（體力勞動或每天訓練）
};

// Calculate TDEE
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile.gender, profile.age, profile.height, profile.weight);
  const tdee = bmr * activityMultipliers[profile.activityLevel];
  return Math.round(tdee);
}

// Calculate calorie target based on goal
export function calculateCalorieTarget(tdee: number, goal: string): number {
  switch (goal) {
    case 'lose':
      return Math.round(tdee * 0.8); // -20% for fat loss
    case 'gain':
      return Math.round(tdee * 1.1); // +10% for muscle gain
    case 'maintain':
    default:
      return tdee;
  }
}

// Calculate macro targets
export function calculateMacros(calories: number, goal: string): MacroTargets {
  let proteinRatio, fatRatio, carbsRatio;

  switch (goal) {
    case 'lose':
      // High protein for fat loss
      proteinRatio = 0.35; // 35%
      fatRatio = 0.25;     // 25%
      carbsRatio = 0.40;   // 40%
      break;
    case 'gain':
      // Balanced for muscle gain
      proteinRatio = 0.30; // 30%
      fatRatio = 0.25;     // 25%
      carbsRatio = 0.45;   // 45%
      break;
    case 'maintain':
    default:
      // Balanced maintenance
      proteinRatio = 0.30; // 30%
      fatRatio = 0.30;     // 30%
      carbsRatio = 0.40;   // 40%
      break;
  }

  const protein = Math.round((calories * proteinRatio) / 4); // 4 cal/g
  const fat = Math.round((calories * fatRatio) / 9);         // 9 cal/g
  const carbs = Math.round((calories * carbsRatio) / 4);     // 4 cal/g

  return { calories, protein, carbs, fat };
}

// Get full nutrition targets
export function getNutritionTargets(profile: UserProfile): MacroTargets {
  const tdee = calculateTDEE(profile);
  const calorieTarget = calculateCalorieTarget(tdee, profile.goal);
  return calculateMacros(calorieTarget, profile.goal);
}

// Activity level labels (Cantonese)
export const activityLabels = {
  sedentary: '久坐（辦公室工作）',
  light: '輕度活動（每週運動1-3天）',
  moderate: '中度活動（每週運動3-5天）',
  active: '高度活動（每週運動6-7天）',
  very_active: '非常活躍（體力勞動或每天訓練）'
};

// Goal labels (Cantonese)
export const goalLabels = {
  lose: '減脂',
  maintain: '維持',
  gain: '增肌'
};
