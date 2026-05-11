import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logWorkout, logDiet, logProgress } from '../../services/firestoreService';
import Navbar from '../Navigation/Navbar';
import { Calendar, Plus, Dumbbell, Utensils, Scale, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Planner() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'workout' | 'diet' | 'weight'>('workout');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [workoutForm, setWorkoutForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    workouts: '',
    notes: ''
  });

  const [dietForm, setDietForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    meals: [{ name: '', calories: '' }],
    notes: ''
  });

  const [weightForm, setWeightForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    notes: ''
  });

  if (!userProfile) {
    navigate('/profile-setup');
    return null;
  }

  const handleWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      await logWorkout({
        userId: userProfile.uid,
        date: new Date(workoutForm.date),
        workouts: workoutForm.workouts.split(',').map(w => w.trim()).filter(w => w),
        completed: true,
        notes: workoutForm.notes
      });

      setSuccess('Workout logged successfully!');
      setWorkoutForm({ date: format(new Date(), 'yyyy-MM-dd'), workouts: '', notes: '' });
    } catch (error) {
      console.error('Error logging workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDietSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const meals = dietForm.meals
        .filter(m => m.name && m.calories)
        .map(m => ({ name: m.name, calories: parseInt(m.calories) }));

      const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

      await logDiet({
        userId: userProfile.uid,
        date: new Date(dietForm.date),
        meals,
        totalCalories,
        notes: dietForm.notes
      });

      setSuccess('Diet logged successfully!');
      setDietForm({ date: format(new Date(), 'yyyy-MM-dd'), meals: [{ name: '', calories: '' }], notes: '' });
    } catch (error) {
      console.error('Error logging diet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      await logProgress({
        userId: userProfile.uid,
        date: new Date(weightForm.date),
        weight: parseFloat(weightForm.weight),
        notes: weightForm.notes
      });

      setSuccess('Weight logged successfully!');
      setWeightForm({ date: format(new Date(), 'yyyy-MM-dd'), weight: '', notes: '' });
    } catch (error) {
      console.error('Error logging weight:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMealField = () => {
    setDietForm({
      ...dietForm,
      meals: [...dietForm.meals, { name: '', calories: '' }]
    });
  };

  const updateMeal = (index: number, field: 'name' | 'calories', value: string) => {
    const newMeals = [...dietForm.meals];
    newMeals[index][field] = value;
    setDietForm({ ...dietForm, meals: newMeals });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Fitness Planner</h1>
            <p className="text-gray-600">Track your workouts, meals, and progress</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2 animate-fadeIn">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'workout'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span>Log Workout</span>
          </button>

          <button
            onClick={() => setActiveTab('diet')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'diet'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span>Log Meals</span>
          </button>

          <button
            onClick={() => setActiveTab('weight')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'weight'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Scale className="w-5 h-5" />
            <span>Log Weight</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {activeTab === 'workout' && (
            <form onSubmit={handleWorkoutSubmit} className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Log Your Workout</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={workoutForm.date}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workouts (comma-separated)
                </label>
                <input
                  type="text"
                  value={workoutForm.workouts}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, workouts: e.target.value })}
                  required
                  placeholder="Push-ups, Squats, Running"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={workoutForm.notes}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
                  rows={3}
                  placeholder="How did you feel? Any observations?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Logging...' : 'Log Workout'}
              </button>
            </form>
          )}

          {activeTab === 'diet' && (
            <form onSubmit={handleDietSubmit} className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Log Your Meals</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={dietForm.date}
                  onChange={(e) => setDietForm({ ...dietForm, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meals</label>
                <div className="space-y-3">
                  {dietForm.meals.map((meal, index) => (
                    <div key={index} className="flex space-x-3">
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => updateMeal(index, 'name', e.target.value)}
                        placeholder="Meal name"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={meal.calories}
                        onChange={(e) => updateMeal(index, 'calories', e.target.value)}
                        placeholder="Calories"
                        className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMealField}
                  className="mt-3 flex items-center space-x-2 text-green-500 hover:text-green-600 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Meal</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={dietForm.notes}
                  onChange={(e) => setDietForm({ ...dietForm, notes: e.target.value })}
                  rows={3}
                  placeholder="How was your nutrition today?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Logging...' : 'Log Meals'}
              </button>
            </form>
          )}

          {activeTab === 'weight' && (
            <form onSubmit={handleWeightSubmit} className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Log Your Weight</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={weightForm.date}
                  onChange={(e) => setWeightForm({ ...weightForm, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightForm.weight}
                  onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })}
                  required
                  placeholder="70.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={weightForm.notes}
                  onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Any changes in routine or diet?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Logging...' : 'Log Weight'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
