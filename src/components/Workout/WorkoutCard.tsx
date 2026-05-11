import { useState } from 'react';
import { WorkoutPlan } from '../../services/geminiService';
import { ChevronDown, ChevronUp, Zap, Heart, Flame } from 'lucide-react';
import workoutImagesData from '../../data/workoutImages.json';

interface WorkoutCardProps {
  workout: WorkoutPlan;
  index: number;
}

type WorkoutImagesJson = {
  workouts: Array<{
    category: string;
    exercises: Array<{
      name: string;
      type: string;
      image: string;
      sets: string;
      reps: string;
    }>;
  }>;
};

const normalizeExerciseName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const workoutImageMap = (() => {
  const data = workoutImagesData as unknown as WorkoutImagesJson;
  const map = new Map<string, string>();
  for (const category of data.workouts || []) {
    for (const ex of category.exercises || []) {
      const key = normalizeExerciseName(ex.name);
      if (key && ex.image) map.set(key, ex.image);
    }
  }
  return map;
})();

export default function WorkoutCard({ workout, index }: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, true>>({});

  const getExerciseImageUrl = (exerciseName: string, category?: string) => {
    const mapped = workoutImageMap.get(normalizeExerciseName(exerciseName));
    if (mapped) return mapped;

    // Uses Unsplash Source (free, no API key). Returned image can vary over time.
    const normalized = exerciseName
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .trim();

    const categoryHint =
      category === 'cardio'
        ? 'cardio'
        : category === 'core'
          ? 'core workout'
          : 'strength training';

    const query = encodeURIComponent(`${normalized} exercise ${categoryHint}`);
    // Use /featured plus a cache buster so different exercises don't reuse one cached image.
    return `https://source.unsplash.com/featured/600x400?${query}&sig=${encodeURIComponent(exerciseName)}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      strength: 'from-blue-500 to-blue-600',
      cardio: 'from-red-500 to-orange-500',
      core: 'from-green-500 to-teal-500',
      default: 'from-gray-500 to-gray-600'
    };
    return colors[category] || colors.default;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: JSX.Element } = {
      strength: <Zap className="w-4 h-4" />,
      cardio: <Flame className="w-4 h-4" />,
      core: <Heart className="w-4 h-4" />
    };
    return icons[category] || icons.strength;
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fadeIn"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`bg-gradient-to-r ${getCategoryColor(workout.exercises[0]?.category || 'default')} p-6 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">{workout.day}</h3>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            {workout.exercises.length} exercises
          </div>
        </div>
        <p className="text-white/90 text-sm">{workout.focus}</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {workout.exercises.slice(0, expanded ? undefined : 2).map((exercise, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="flex flex-col gap-3 mb-2">
                <div
                  className={`relative h-28 w-full overflow-hidden rounded-lg border border-gray-200 ${
                    brokenImages[exercise.name] ? `bg-gradient-to-br ${getCategoryColor(exercise.category)}` : 'bg-gray-100'
                  }`}
                >
                  {brokenImages[exercise.name] ? (
                    <div className="h-full w-full flex items-center justify-center text-white/90">
                      <div className="flex flex-col items-center gap-1">
                        <div className="scale-125">{getCategoryIcon(exercise.category)}</div>
                        <span className="text-[10px] font-medium">No image</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={getExerciseImageUrl(exercise.name, exercise.category)}
                      alt={`${exercise.name} demonstration`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={() => setBrokenImages((prev) => ({ ...prev, [exercise.name]: true }))}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <div className={`bg-gradient-to-r ${getCategoryColor(exercise.category)} p-1.5 rounded-md text-white shrink-0`}>
                      {getCategoryIcon(exercise.category)}
                    </div>
                    <h4 className="font-semibold text-gray-800 truncate">{exercise.name}</h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2 mt-2 text-sm text-gray-600">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {exercise.sets} sets
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {exercise.reps} reps
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">{exercise.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {workout.exercises.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2 text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            <span>{expanded ? 'Show Less' : `Show ${workout.exercises.length - 2} More`}</span>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}
