export interface UserMetrics {
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
  activityLevel: string;
  fitnessGoal: string;
}

export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
};

export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const activityMultipliers: { [key: string]: number } = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9
  };
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
};

export const calculateCalorieGoal = (tdee: number, goal: string): number => {
  switch (goal) {
    case 'lose-weight':
      return Math.round(tdee - 500);
    case 'gain-muscle':
      return Math.round(tdee + 300);
    case 'maintain':
    default:
      return tdee;
  }
};

export const calculateMacros = (calories: number, goal: string) => {
  let proteinPercent = 0.3;
  let carbPercent = 0.4;
  let fatPercent = 0.3;

  if (goal === 'lose-weight') {
    proteinPercent = 0.35;
    carbPercent = 0.35;
    fatPercent = 0.3;
  } else if (goal === 'gain-muscle') {
    proteinPercent = 0.35;
    carbPercent = 0.45;
    fatPercent = 0.2;
  }

  return {
    protein: Math.round((calories * proteinPercent) / 4),
    carbs: Math.round((calories * carbPercent) / 4),
    fats: Math.round((calories * fatPercent) / 9)
  };
};
