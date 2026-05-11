import { useEffect, useState } from 'react';
import type { UserProfile } from '../../services/firestoreService';
import type { DietPlan } from '../../services/geminiService';
import DietCard from './DietCard';
import { Utensils, Loader } from 'lucide-react';

interface DietSectionProps {
  userProfile: UserProfile;
  calorieGoal: number;
}

export default function DietSection({ userProfile, calorieGoal }: DietSectionProps) {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDietPlan = async () => {
      setLoading(true);
      try {
        const { generateDietPlan } = await import('../../services/geminiService');
        const plan = await generateDietPlan(
          {
            age: userProfile.age,
            height: userProfile.height,
            weight: userProfile.weight,
            gender: userProfile.gender,
            activityLevel: userProfile.activityLevel,
            fitnessGoal: userProfile.fitnessGoal
          },
          calorieGoal
        );
        setDietPlan(plan);
      } catch (error) {
        console.error('Error loading diet plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDietPlan();
  }, [userProfile, calorieGoal]);

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
          <Utensils className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Nutrition Plan</h2>
          <p className="text-gray-600 text-sm">AI-optimized meal suggestions</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Creating your personalized nutrition plan...</p>
        </div>
      ) : dietPlan ? (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Totals</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{dietPlan.totalCalories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{dietPlan.totalProtein}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{dietPlan.totalCarbs}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">{dietPlan.totalFats}g</div>
                <div className="text-sm text-gray-600">Fats</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dietPlan.meals.map((meal, index) => (
              <DietCard key={index} meal={meal} index={index} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-600">
          Failed to load diet plan. Please try again later.
        </div>
      )}
    </div>
  );
}
