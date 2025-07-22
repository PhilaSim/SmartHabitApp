import { useHabitStats } from '../../hooks/useHabitStats';
import { StatsChart } from './StatsChart';
import { Card } from '../ui/Card';
import { BarChart3, TrendingUp, Calendar, Award } from 'lucide-react';

export function StatsPage() {
  const { stats, loading } = useHabitStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate summary stats
  const recentStats = stats.slice(-7); // Last 7 days
  const avgCompletion = recentStats.length > 0 
    ? Math.round(recentStats.reduce((sum, stat) => sum + stat.percentage, 0) / recentStats.length)
    : 0;
  
  const bestDay = stats.reduce((best, current) => 
    current.percentage > best.percentage ? current : best, stats[0] || { percentage: 0 });
  
  const totalDaysTracked = stats.filter(stat => stat.total > 0).length;
  const perfectDays = stats.filter(stat => stat.percentage === 100 && stat.total > 0).length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <span>Your Progress Stats</span>
        </h1>
        <p className="text-lg text-gray-600">Track your habit completion over the last 30 days</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgCompletion}%</p>
          <p className="text-sm text-gray-600">7-Day Average</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{perfectDays}</p>
          <p className="text-sm text-gray-600">Perfect Days</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{bestDay?.percentage || 0}%</p>
          <p className="text-sm text-gray-600">Best Day</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalDaysTracked}</p>
          <p className="text-sm text-gray-600">Days Tracked</p>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Completion Rate</h2>
        {stats.length > 0 ? (
          <StatsChart data={stats} />
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No data available yet. Start tracking your habits to see your progress!</p>
          </div>
        )}
      </Card>

      {/* Insights */}
      {stats.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Insights</h2>
          <div className="space-y-3 text-sm">
            {avgCompletion >= 80 && (
              <p className="text-green-700 bg-green-50 p-3 rounded-lg">
                🎉 Excellent! You're maintaining an {avgCompletion}% completion rate over the last week.
              </p>
            )}
            {perfectDays > 0 && (
              <p className="text-blue-700 bg-blue-50 p-3 rounded-lg">
                ⭐ You've had {perfectDays} perfect days where you completed all your habits!
              </p>
            )}
            {avgCompletion < 50 && totalDaysTracked > 3 && (
              <p className="text-amber-700 bg-amber-50 p-3 rounded-lg">
                💪 Your completion rate is at {avgCompletion}%. Consider starting with fewer habits to build consistency.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}