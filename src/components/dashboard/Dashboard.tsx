import { useHabits } from '../../hooks/useHabits';
import { useBadges } from '../../hooks/useBadges';
import { HabitCard } from '../habits/HabitCard';
import { BadgeDisplay } from '../badges/BadgeDisplay';
import { Card } from '../ui/Card';
import { Calendar, TrendingUp, Target, Award } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';

export function Dashboard() {
  const { habits, loading, toggleHabitCompletion, deleteHabit } = useHabits();
  const { badges, checkAndAwardBadges } = useBadges();

  useEffect(() => {
    if (habits.length > 0) {
      checkAndAwardBadges(habits);
    }
  }, [habits, checkAndAwardBadges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const todayCompletedCount = habits.filter(h => h.completed_today).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((todayCompletedCount / totalHabits) * 100) : 0;
  const totalStreak = habits.reduce((sum, h) => sum + h.current_streak, 0);
  const avgStreak = totalHabits > 0 ? Math.round(totalStreak / totalHabits) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Good morning! 🌅
        </h1>
        <p className="text-lg text-gray-600 flex items-center justify-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayCompletedCount}/{totalHabits}</p>
          <p className="text-sm text-gray-600">Completed Today</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
          <p className="text-sm text-gray-600">Completion Rate</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgStreak}</p>
          <p className="text-sm text-gray-600">Avg Streak</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalHabits}</p>
          <p className="text-sm text-gray-600">Total Habits</p>
        </Card>
      </div>

      {/* Recent Badges */}
      {badges.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Recent Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.slice(0, 4).map((badge) => (
              <Card key={badge.id} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <div className="text-2xl mb-2">{badge.badge_icon}</div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{badge.badge_name}</h4>
                <p className="text-xs text-gray-600">{badge.badge_description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Today's Habits */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Habits</h2>
        {habits.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-600 mb-6">Start building better habits by adding your first one!</p>
            <button
              onClick={() => window.location.hash = '#add-habit'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add Your First Habit
            </button>
          </Card>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCompletion}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}