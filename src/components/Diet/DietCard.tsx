import { Meal } from '../../services/geminiService';
import { Clock, Flame } from 'lucide-react';

interface DietCardProps {
  meal: Meal;
  index: number;
}

export default function DietCard({ meal, index }: DietCardProps) {
  const getMealGradient = (mealName: string) => {
    const gradients: { [key: string]: string } = {
      breakfast: 'from-yellow-400 to-orange-500',
      lunch: 'from-green-400 to-teal-500',
      snack: 'from-purple-400 to-pink-500',
      dinner: 'from-blue-500 to-indigo-600',
      default: 'from-gray-400 to-gray-600'
    };

    const key = mealName.toLowerCase();
    return gradients[key] || gradients.default;
  };

  const getMealEmoji = (mealName: string) => {
    const emojis: { [key: string]: string } = {
      breakfast: '🌅',
      lunch: '🍽️',
      snack: '🥗',
      dinner: '🌙',
      default: '🍴'
    };

    const key = mealName.toLowerCase();
    return emojis[key] || emojis.default;
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fadeIn"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`bg-gradient-to-r ${getMealGradient(meal.name)} p-6 text-white`}>
        <div className="text-4xl mb-2">{getMealEmoji(meal.name)}</div>
        <h3 className="text-xl font-bold mb-1">{meal.name}</h3>
        <div className="flex items-center space-x-2 text-sm text-white/90">
          <Clock className="w-4 h-4" />
          <span>{meal.time}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-bold text-gray-800">{meal.calories}</span>
          </div>
          <span className="text-sm text-gray-600">calories</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">{meal.protein}g</div>
            <div className="text-xs text-gray-600">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">{meal.carbs}g</div>
            <div className="text-xs text-gray-600">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">{meal.fats}g</div>
            <div className="text-xs text-gray-600">Fats</div>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{meal.description}</p>
      </div>
    </div>
  );
}
