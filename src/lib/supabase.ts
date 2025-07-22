import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the development server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Test connection and provide helpful error messages
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('habits').select('count', { count: 'exact', head: true });
    if (error && error.message.includes('Failed to fetch')) {
      console.error('Supabase connection failed. Please verify your VITE_SUPABASE_URL is correct.');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

export type Habit = {
  id: string;
  user_id: string;
  habit_name: string;
  category_id?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  priority_level: 'low' | 'medium' | 'high';
  reminder_time?: string;
  created_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
};

export type HabitWithCompletion = Habit & {
  completed_today: boolean;
  current_streak: number;
  total_completions: number;
  category?: HabitCategory;
};

export type HabitCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  earned_at: string;
};

export type HabitNote = {
  id: string;
  habit_log_id: string;
  user_id: string;
  note: string;
  created_at: string;
};