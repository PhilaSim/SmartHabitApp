import { useState, useEffect } from 'react';
import { supabase, type Habit, type HabitLog, type HabitWithCompletion, type HabitCategory } from '../lib/supabase';
import { format, startOfDay } from 'date-fns';
import { useAuth } from './useAuth';

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [categories, setCategories] = useState<HabitCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHabits = async () => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch habits with today's completion status
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select(`
          *,
          habit_categories (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', user.id);

      if (habitsError) throw habitsError;

      // Process habits to include completion info
      const processedHabits = await Promise.all(
        (habitsData || []).map(async (habit: any) => {
          // Check today's completion
          const { data: todayLog } = await supabase
            .from('habit_logs')
            .select('completed')
            .eq('habit_id', habit.id)
            .eq('date', today)
            .maybeSingle();

          // Calculate streak
          const { data: logs } = await supabase
            .from('habit_logs')
            .select('date, completed')
            .eq('habit_id', habit.id)
            .eq('completed', true)
            .order('date', { ascending: false });

          let currentStreak = 0;
          if (logs && logs.length > 0) {
            const sortedLogs = logs.sort((a, b) => b.date.localeCompare(a.date));
            let checkDate = new Date();
            
            for (const log of sortedLogs) {
              const logDate = new Date(log.date);
              const expectedDate = format(checkDate, 'yyyy-MM-dd');
              
              if (log.date === expectedDate) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }
          }

          return {
            ...habit,
            category: habit.habit_categories,
            completed_today: todayLog?.[0]?.completed || false,
            current_streak: currentStreak,
            total_completions: logs?.length || 0,
          };
        })
      );

      setHabits(processedHabits);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('habit_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createHabit = async (habitData: {
    name: string;
    category_id?: string;
    difficulty_level: 'easy' | 'medium' | 'hard';
    priority_level: 'low' | 'medium' | 'high';
    reminder_time?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .insert([
          {
            user_id: user.id,
            habit_name: habitData.name,
            category_id: habitData.category_id,
            difficulty_level: habitData.difficulty_level,
            priority_level: habitData.priority_level,
            reminder_time: habitData.reminder_time,
          },
        ]);

      if (error) throw error;
      await fetchHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  };

  const toggleHabitCompletion = async (habitId: string, completed: boolean) => {
    if (!user) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      const { error } = await supabase
        .from('habit_logs')
        .upsert([
          {
            habit_id: habitId,
            date: today,
            completed,
          },
        ]);

      if (error) throw error;
      await fetchHabits();
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw error;
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;
      await fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchHabits();
    fetchCategories();
  }, [user]);

  return {
    habits,
    categories,
    loading,
    createHabit,
    toggleHabitCompletion,
    deleteHabit,
    refetch: fetchHabits,
  };
}