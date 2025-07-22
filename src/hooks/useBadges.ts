import { useState, useEffect } from 'react';
import { supabase, type UserBadge } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useBadges() {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBadges = async () => {
    if (!user) {
      setBadges([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.');
      } else {
        console.error('Error fetching badges:', error);
      }
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardBadges = async (habits: any[]) => {
    if (!user) return;
    if (!user.id) return;
    
    // Skip badge checking if we can't connect to Supabase
    try {
      const { error: testError } = await supabase
        .from('user_badges')
        .select('count', { count: 'exact', head: true });
      
      if (testError && testError.message.includes('Failed to fetch')) {
        console.warn('Skipping badge check due to Supabase connection issues');
        return;
      }
    } catch (error) {
      console.warn('Skipping badge check due to connection error:', error);
      return;
    }

    try {
      const completedHabits = habits.filter(h => h.completed_today);
      const totalCompletions = habits.reduce((sum, h) => sum + h.total_completions, 0);
      const maxStreak = Math.max(...habits.map(h => h.current_streak), 0);

      const badgesToCheck = [
        {
          type: 'first_habit',
          name: 'Getting Started',
          description: 'Created your first habit',
          icon: '🌱',
          condition: habits.length >= 1
        },
        {
          type: 'perfect_day',
          name: 'Perfect Day',
          description: 'Completed all habits in a day',
          icon: '⭐',
          condition: completedHabits.length > 0 && completedHabits.length === habits.length
        },
        {
          type: 'week_warrior',
          name: 'Week Warrior',
          description: 'Maintained a 7-day streak',
          icon: '🔥',
          condition: maxStreak >= 7
        },
        {
          type: 'habit_master',
          name: 'Habit Master',
          description: 'Completed 100 habits total',
          icon: '🏆',
          condition: totalCompletions >= 100
        },
        {
          type: 'consistency_king',
          name: 'Consistency King',
          description: 'Maintained a 30-day streak',
          icon: '👑',
          condition: maxStreak >= 30
        }
      ];

      for (const badge of badgesToCheck) {
        if (badge.condition) {
          const { error } = await supabase
            .from('user_badges')
            .upsert([
              {
                user_id: user.id,
                badge_type: badge.type,
                badge_name: badge.name,
                badge_description: badge.description,
                badge_icon: badge.icon,
              }
            ], { onConflict: 'user_id,badge_type' });

          if (error && !error.message.includes('duplicate')) {
            console.error('Error awarding badge:', error);
          }
        }
      }

      // Only refetch badges if the initial fetch was successful
      try {
        await fetchBadges();
      } catch (fetchError) {
        console.error('Error refetching badges after awarding:', fetchError);
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, [user]);

  return {
    badges,
    loading,
    checkAndAwardBadges,
    refetch: fetchBadges,
  };
}