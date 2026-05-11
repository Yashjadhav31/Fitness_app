import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { calculateBMI, calculateBMR, calculateTDEE, calculateCalorieGoal, getBMICategory } from '../../utils/calculations';
import { Activity, TrendingUp, Target, Flame } from 'lucide-react';
import Navbar from '../Navigation/Navbar';
import WorkoutSection from '../Workout/WorkoutSection';
import DietSection from '../Diet/DietSection';
import ProgressChart from '../Charts/ProgressChart';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    bmi: 0,
    bmiCategory: '',
    bmr: 0,
    tdee: 0,
    calorieGoal: 0
  });

  useEffect(() => {
    if (!userProfile) {
      navigate('/profile-setup');
      return;
    }

    const bmi = calculateBMI(userProfile.weight, userProfile.height);
    const bmiCategory = getBMICategory(bmi);
    const bmr = calculateBMR(userProfile.weight, userProfile.height, userProfile.age, userProfile.gender);
    const tdee = calculateTDEE(bmr, userProfile.activityLevel);
    const calorieGoal = calculateCalorieGoal(tdee, userProfile.fitnessGoal);

    setMetrics({ bmi, bmiCategory, bmr, tdee, calorieGoal });
  }, [userProfile, navigate]);

  if (!userProfile) {
    return null;
  }

  const getGoalLabel = (goal: string) => {
    const goals: { [key: string]: string } = {
      'lose-weight': 'Lose Weight',
      'gain-muscle': 'Gain Muscle',
      'maintain': 'Stay Fit'
    };
    return goals[goal] || goal;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {userProfile.email.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Here's your fitness overview for today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                {metrics.bmiCategory}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{metrics.bmi}</div>
            <div className="text-blue-100 text-sm">Body Mass Index</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{metrics.bmr}</div>
            <div className="text-green-100 text-sm">Basal Metabolic Rate</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{metrics.calorieGoal}</div>
            <div className="text-orange-100 text-sm">Daily Calorie Goal</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold mb-1">{getGoalLabel(userProfile.fitnessGoal)}</div>
            <div className="text-purple-100 text-sm">Current Goal</div>
          </div>
        </div>

        <div className="mb-8">
          <ProgressChart userId={userProfile.uid} />
        </div>

        <WorkoutSection userProfile={userProfile} />

        <DietSection userProfile={userProfile} calorieGoal={metrics.calorieGoal} />
      </div>
    </div>
  );
}
