import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserMetrics } from '../utils/calculations';

const geminiApiKeyRaw = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const geminiApiKey = (geminiApiKeyRaw || '').trim();
const preferredModelName =
  ((import.meta.env.VITE_GEMINI_MODEL as string | undefined) || '').trim() ||
  'gemini-2.0-flash';

const genAI = geminiApiKey.length > 0 ? new GoogleGenerativeAI(geminiApiKey) : null;
const enableAiWorkout =
  String(import.meta.env.VITE_ENABLE_AI_WORKOUT || '').toLowerCase() === 'true';

const candidateModelNames = (preferred: string) => {
  const defaults = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  const seen = new Set<string>();
  const add = (m: string) => {
    const v = m.trim();
    if (!v || seen.has(v)) return;
    seen.add(v);
  };
  add(preferred);
  defaults.forEach(add);
  return Array.from(seen);
};

async function generateWithFirstWorkingModel(prompt: string) {
  if (!genAI) return null;

  let lastError: unknown = null;
  for (const modelName of candidateModelNames(preferredModelName)) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return await result.response.text();
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      // If the model isn't supported, try next candidate.
      if (message.includes('models/') && message.includes('is not found')) continue;
      if (message.includes('not found for API version')) continue;
      throw err;
    }
  }

  // None of the known models worked for this key/version.
  throw lastError;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  description: string;
  category: string;
  image?: string;
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  description: string;
}

export interface WorkoutPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface DietPlan {
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

const getDefaultWorkoutPlan = (goal: string): WorkoutPlan[] => {
  const baseWorkouts: { [key: string]: WorkoutPlan[] } = {
    'lose-weight': [
      {
        day: 'Monday',
        focus: 'Full Body Cardio',
        exercises: [
          { name: 'Jumping Jacks', sets: 3, reps: '30 seconds', description: 'Full body cardio warmup', category: 'cardio' },
          { name: 'Burpees', sets: 3, reps: '10-12', description: 'High-intensity full body exercise', category: 'cardio' },
          { name: 'Mountain Climbers', sets: 3, reps: '20', description: 'Core and cardio combination', category: 'cardio' },
          { name: 'High Knees', sets: 3, reps: '30 seconds', description: 'Cardio exercise to burn calories', category: 'cardio' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Lower Body & Core',
        exercises: [
          { name: 'Squats', sets: 3, reps: '15-20', description: 'Leg strengthening exercise', category: 'strength' },
          { name: 'Lunges', sets: 3, reps: '12 each leg', description: 'Unilateral leg exercise', category: 'strength' },
          { name: 'Plank', sets: 3, reps: '45 seconds', description: 'Core stability exercise', category: 'core' },
          { name: 'Russian Twists', sets: 3, reps: '20', description: 'Oblique strengthening', category: 'core' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Upper Body & HIIT',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: '10-15', description: 'Chest and tricep exercise', category: 'strength' },
          { name: 'Tricep Dips', sets: 3, reps: '12', description: 'Tricep isolation exercise', category: 'strength' },
          { name: 'Jump Squats', sets: 3, reps: '15', description: 'Explosive leg exercise', category: 'cardio' },
          { name: 'Bicycle Crunches', sets: 3, reps: '20', description: 'Core rotational exercise', category: 'core' }
        ]
      }
    ],
    'gain-muscle': [
      {
        day: 'Monday',
        focus: 'Chest & Triceps',
        exercises: [
          { name: 'Push-ups', sets: 4, reps: '12-15', description: 'Chest and tricep builder', category: 'strength' },
          { name: 'Diamond Push-ups', sets: 3, reps: '10-12', description: 'Tricep focused push-up', category: 'strength' },
          { name: 'Chest Dips', sets: 3, reps: '10-12', description: 'Lower chest exercise', category: 'strength' },
          { name: 'Tricep Extensions', sets: 3, reps: '12-15', description: 'Tricep isolation', category: 'strength' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Back & Biceps',
        exercises: [
          { name: 'Pull-ups', sets: 4, reps: '8-10', description: 'Back and bicep compound', category: 'strength' },
          { name: 'Inverted Rows', sets: 3, reps: '12-15', description: 'Horizontal pulling exercise', category: 'strength' },
          { name: 'Bicep Curls', sets: 3, reps: '12-15', description: 'Bicep isolation', category: 'strength' },
          { name: 'Hammer Curls', sets: 3, reps: '12-15', description: 'Bicep and forearm exercise', category: 'strength' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Legs & Shoulders',
        exercises: [
          { name: 'Squats', sets: 4, reps: '12-15', description: 'Quad and glute builder', category: 'strength' },
          { name: 'Bulgarian Split Squats', sets: 3, reps: '10 each leg', description: 'Unilateral leg exercise', category: 'strength' },
          { name: 'Pike Push-ups', sets: 3, reps: '12-15', description: 'Shoulder focused exercise', category: 'strength' },
          { name: 'Lateral Raises', sets: 3, reps: '15', description: 'Shoulder isolation', category: 'strength' }
        ]
      }
    ],
    'maintain': [
      {
        day: 'Monday',
        focus: 'Full Body Strength',
        exercises: [
          { name: 'Squats', sets: 3, reps: '12-15', description: 'Leg compound exercise', category: 'strength' },
          { name: 'Push-ups', sets: 3, reps: '12-15', description: 'Upper body push', category: 'strength' },
          { name: 'Rows', sets: 3, reps: '12-15', description: 'Upper body pull', category: 'strength' },
          { name: 'Plank', sets: 3, reps: '45 seconds', description: 'Core stability', category: 'core' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Cardio & Core',
        exercises: [
          { name: 'Jumping Jacks', sets: 3, reps: '30 seconds', description: 'Cardio warmup', category: 'cardio' },
          { name: 'Mountain Climbers', sets: 3, reps: '20', description: 'Cardio and core', category: 'cardio' },
          { name: 'Russian Twists', sets: 3, reps: '20', description: 'Core rotational', category: 'core' },
          { name: 'Leg Raises', sets: 3, reps: '12-15', description: 'Lower ab exercise', category: 'core' }
        ]
      }
    ]
  };

  return baseWorkouts[goal] || baseWorkouts['maintain'];
};

const getDefaultDietPlan = (calories: number): DietPlan => {
  const breakfastCal = Math.round(calories * 0.25);
  const lunchCal = Math.round(calories * 0.35);
  const dinnerCal = Math.round(calories * 0.30);
  const snackCal = Math.round(calories * 0.10);

  return {
    meals: [
      {
        name: 'Breakfast',
        calories: breakfastCal,
        protein: Math.round(breakfastCal * 0.3 / 4),
        carbs: Math.round(breakfastCal * 0.5 / 4),
        fats: Math.round(breakfastCal * 0.2 / 9),
        time: '7:00 AM',
        description: 'Oatmeal with fruits, nuts, and protein shake'
      },
      {
        name: 'Lunch',
        calories: lunchCal,
        protein: Math.round(lunchCal * 0.35 / 4),
        carbs: Math.round(lunchCal * 0.45 / 4),
        fats: Math.round(lunchCal * 0.2 / 9),
        time: '12:30 PM',
        description: 'Grilled chicken with brown rice and vegetables'
      },
      {
        name: 'Snack',
        calories: snackCal,
        protein: Math.round(snackCal * 0.3 / 4),
        carbs: Math.round(snackCal * 0.5 / 4),
        fats: Math.round(snackCal * 0.2 / 9),
        time: '4:00 PM',
        description: 'Greek yogurt with berries and almonds'
      },
      {
        name: 'Dinner',
        calories: dinnerCal,
        protein: Math.round(dinnerCal * 0.4 / 4),
        carbs: Math.round(dinnerCal * 0.35 / 4),
        fats: Math.round(dinnerCal * 0.25 / 9),
        time: '7:00 PM',
        description: 'Baked fish with quinoa and steamed broccoli'
      }
    ],
    totalCalories: calories,
    totalProtein: Math.round(calories * 0.3 / 4),
    totalCarbs: Math.round(calories * 0.45 / 4),
    totalFats: Math.round(calories * 0.25 / 9)
  };
};

export const generateWorkoutPlan = async (metrics: UserMetrics): Promise<WorkoutPlan[]> => {
  try {
    // Avoid consuming Gemini quota for workouts unless explicitly enabled.
    if (!enableAiWorkout) return getDefaultWorkoutPlan(metrics.fitnessGoal);

    const prompt = `Generate a personalized weekly workout plan for:
- Age: ${metrics.age}
- Height: ${metrics.height}cm
- Weight: ${metrics.weight}kg
- Gender: ${metrics.gender}
- Activity Level: ${metrics.activityLevel}
- Fitness Goal: ${metrics.fitnessGoal}

Provide 3 workout days with specific exercises. Format as JSON array with this structure:
[{
  "day": "Monday",
  "focus": "workout focus",
  "exercises": [{
    "name": "exercise name",
    "sets": 3,
    "reps": "12-15",
    "description": "exercise description",
    "category": "strength/cardio/core"
  }]
}]

Make it practical for home/gym workouts. Include variety in exercise types.`;

    const text = await generateWithFirstWorkingModel(prompt);
    if (!text) return getDefaultWorkoutPlan(metrics.fitnessGoal);

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    return getDefaultWorkoutPlan(metrics.fitnessGoal);
  } catch (error) {
    console.warn('Error generating workout plan (falling back to defaults):', error);
    return getDefaultWorkoutPlan(metrics.fitnessGoal);
  }
};

export const generateDietPlan = async (metrics: UserMetrics, targetCalories: number): Promise<DietPlan> => {
  try {
    const prompt = `Generate a personalized daily diet plan for:
- Age: ${metrics.age}
- Weight: ${metrics.weight}kg
- Gender: ${metrics.gender}
- Activity Level: ${metrics.activityLevel}
- Fitness Goal: ${metrics.fitnessGoal}
- Target Calories: ${targetCalories}

Provide 4 meals (breakfast, lunch, snack, dinner). Format as JSON:
{
  "meals": [{
    "name": "Breakfast",
    "calories": 500,
    "protein": 30,
    "carbs": 60,
    "fats": 15,
    "time": "7:00 AM",
    "description": "meal description with specific foods"
  }],
  "totalCalories": ${targetCalories},
  "totalProtein": number,
  "totalCarbs": number,
  "totalFats": number
}

Make meals realistic and balanced for ${metrics.fitnessGoal}.`;

    const text = await generateWithFirstWorkingModel(prompt);
    if (!text) return getDefaultDietPlan(targetCalories);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }

    return getDefaultDietPlan(targetCalories);
  } catch (error) {
    console.warn('Error generating diet plan (falling back to defaults):', error);
    return getDefaultDietPlan(targetCalories);
  }
};
