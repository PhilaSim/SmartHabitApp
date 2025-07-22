import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, subDays, startOfDay } from 'date-fns';
import { useAuth } from './useAuth';

export interface DailyStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export function useHabitStats() {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) {
      setStats([]);
      setLoading(false);
      return;
    }

    try {
      // Get last 30 days of data
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return format(date, 'yyyy-MM-dd');
      });

      const statsData = await Promise.all(
        dates.map(async (date) => {
          // Get all habits for the user
          const { data: habits } = await supabase
            .from('habits')
            .select('id')
            .eq('user_id', user.id)
            .lte('created_at', `${date}T23:59:59.999Z`);

          const totalHabits = habits?.length || 0;

          if (totalHabits === 0) {
            return {
              date,
              completed: 0,
              total: 0,
              percentage: 0,
            };
          }

          // Get completed habits for this date
          const { data: logs } = await supabase
            .from('habit_logs')
            .select('habit_id')
            .eq('date', date)
            .eq('completed', true)
            .in('habit_id', habits?.map(h => h.id) || []);

          const completedHabits = logs?.length || 0;
          const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

          return {
            date,
            completed: completedHabits,
            total: totalHabits,
            percentage,
          };
        })
      );

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching habit stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}