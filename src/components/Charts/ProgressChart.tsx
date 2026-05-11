import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  getProgressLogs,
  getWorkoutLogs,
  getDietLogs,
  type ProgressLogRecord,
  type WorkoutLogRecord,
  type DietLogRecord,
} from '../../services/firestoreService';
import { TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface ProgressChartProps {
  userId: string;
}

export default function ProgressChart({ userId }: ProgressChartProps) {
  const [chartType, setChartType] = useState<'weight' | 'workouts' | 'calories'>('weight');
  const [data, setData] = useState<Array<{ date: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const onUpdate = () => setRefreshTick((t) => t + 1);
    window.addEventListener('fitness_app:logs_updated', onUpdate);
    return () => window.removeEventListener('fitness_app:logs_updated', onUpdate);
  }, []);

  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 30);

        if (chartType === 'weight') {
          const progressData = await getProgressLogs(userId, 30);
          const formattedData = progressData
            .reverse()
            .map((entry: ProgressLogRecord) => ({
              date: format(new Date(entry.date), 'MMM dd'),
              value: typeof entry.weight === 'number' ? entry.weight : 0
            }));
          setData(formattedData);
        } else if (chartType === 'workouts') {
          const workoutData = await getWorkoutLogs(userId, startDate, endDate);
          const workoutsByDate: { [key: string]: number } = {};

          workoutData.forEach((log: WorkoutLogRecord) => {
            const dateStr = format(new Date(log.date), 'MMM dd');
            workoutsByDate[dateStr] =
              (workoutsByDate[dateStr] || 0) + (Array.isArray(log.workouts) ? log.workouts.length : 0);
          });

          const formattedData = Object.entries(workoutsByDate).map(([date, count]) => ({
            date,
            value: count
          }));
          setData(formattedData);
        } else if (chartType === 'calories') {
          const dietData = await getDietLogs(userId, startDate, endDate);
          const formattedData = dietData
            .reverse()
            .map((log: DietLogRecord) => ({
              date: format(new Date(log.date), 'MMM dd'),
              value: typeof log.totalCalories === 'number' ? log.totalCalories : 0
            }));
          setData(formattedData);
        }
      } catch (error) {
        console.error('Error loading chart data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [userId, chartType, refreshTick]);

  const getChartColor = () => {
    switch (chartType) {
      case 'weight':
        return '#3b82f6';
      case 'workouts':
        return '#10b981';
      case 'calories':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  const getChartLabel = () => {
    switch (chartType) {
      case 'weight':
        return 'Weight (kg)';
      case 'workouts':
        return 'Workouts Completed';
      case 'calories':
        return 'Calories Consumed';
      default:
        return 'Value';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Progress Tracking</h2>
            <p className="text-gray-600 text-sm">Last 30 days</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setChartType('weight')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            chartType === 'weight'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Weight
        </button>
        <button
          onClick={() => setChartType('workouts')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            chartType === 'workouts'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Workouts
        </button>
        <button
          onClick={() => setChartType('calories')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            chartType === 'calories'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Calories
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
          <p>No data available yet</p>
          <p className="text-sm">Start logging your progress to see trends</p>
        </div>
      ) : chartType === 'workouts' ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" fill={getChartColor()} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={getChartColor()}
              strokeWidth={3}
              dot={{ fill: getChartColor(), r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 text-center text-sm text-gray-600">
        {getChartLabel()}
      </div>
    </div>
  );
}
