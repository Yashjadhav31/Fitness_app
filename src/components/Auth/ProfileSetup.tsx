import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createUserProfile } from '../../services/firestoreService';
import { User, Activity, Target } from 'lucide-react';

export default function ProfileSetup() {
  const { currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: 'male' as 'male' | 'female',
    activityLevel: 'moderate',
    fitnessGoal: 'maintain'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!currentUser) {
      setError('No user logged in');
      setLoading(false);
      return;
    }

    try {
      await createUserProfile({
        uid: currentUser.uid,
        email: currentUser.email || '',
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        fitnessGoal: formData.fitnessGoal,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      navigate('/dashboard');
      void refreshProfile();
    } catch (err) {
      setError('Failed to create profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.age || !formData.height || !formData.weight)) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-center text-gray-600">Help us personalize your fitness journey</p>

          <div className="flex items-center justify-center mt-6 space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-12 bg-blue-500' : s < step ? 'w-8 bg-green-500' : 'w-8 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="13"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    required
                    min="100"
                    max="250"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    min="30"
                    max="300"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="70"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-800">Activity Level</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How active are you?
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                    { value: 'light', label: 'Lightly Active', desc: 'Exercise 1-3 times/week' },
                    { value: 'moderate', label: 'Moderately Active', desc: 'Exercise 4-5 times/week' },
                    { value: 'active', label: 'Very Active', desc: 'Exercise 6-7 times/week' },
                    { value: 'very-active', label: 'Super Active', desc: 'Very intense exercise daily' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.activityLevel === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="activityLevel"
                        value={option.value}
                        checked={formData.activityLevel === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-800">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-800">Fitness Goal</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your primary goal?
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'lose-weight', label: 'Lose Weight', desc: 'Burn fat and get leaner', icon: '🔥' },
                    { value: 'gain-muscle', label: 'Gain Muscle', desc: 'Build strength and muscle mass', icon: '💪' },
                    { value: 'maintain', label: 'Stay Fit', desc: 'Maintain current fitness level', icon: '⚡' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.fitnessGoal === option.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="fitnessGoal"
                        value={option.value}
                        checked={formData.fitnessGoal === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-green-500"
                      />
                      <span className="text-2xl ml-3">{option.icon}</span>
                      <div className="ml-3">
                        <div className="font-medium text-gray-800">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Profile...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
