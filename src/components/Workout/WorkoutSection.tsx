import { useEffect, useState } from 'react';
import type { UserProfile } from '../../services/firestoreService';
import type { WorkoutPlan } from '../../services/geminiService';
import WorkoutCard from './WorkoutCard';
import { Dumbbell, Loader } from 'lucide-react';

interface WorkoutSectionProps {
  userProfile: UserProfile;
}

export default function WorkoutSection({ userProfile }: WorkoutSectionProps) {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkoutPlan = async () => {
      setLoading(true);
      try {
        const { generateWorkoutPlan } = await import('../../services/geminiService');
        const plan = await generateWorkoutPlan({
          age: userProfile.age,
          height: userProfile.height,
          weight: userProfile.weight,
          gender: userProfile.gender,
          activityLevel: userProfile.activityLevel,
          fitnessGoal: userProfile.fitnessGoal
        });
        setWorkoutPlan(plan);
      } catch (error) {
        console.error('Error loading workout plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutPlan();
  }, [userProfile]);

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Workout Plan</h2>
          <p className="text-gray-600 text-sm">AI-generated personalized exercises</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Generating your personalized workout plan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutPlan.map((day, index) => (
            <WorkoutCard key={index} workout={day} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
