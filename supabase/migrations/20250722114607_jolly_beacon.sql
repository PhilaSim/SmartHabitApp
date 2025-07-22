/*
  # Enhanced Habit Tracker Features

  1. New Tables
    - `habit_categories` - predefined categories for organizing habits
    - `user_badges` - tracks earned badges for gamification
    - `habit_notes` - allows users to add notes to habit completions

  2. Table Updates
    - `habits` table: add category_id, difficulty_level, priority_level, reminder_time
    - `habit_logs` table: add notes field

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Create habit categories table
CREATE TABLE IF NOT EXISTS habit_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO habit_categories (name, icon, color) VALUES
  ('Health', '🏥', '#10B981'),
  ('Fitness', '💪', '#F59E0B'),
  ('Learning', '📚', '#3B82F6'),
  ('Productivity', '⚡', '#8B5CF6'),
  ('Mindfulness', '🧘', '#06B6D4'),
  ('Social', '👥', '#EF4444'),
  ('Creativity', '🎨', '#EC4899'),
  ('Finance', '💰', '#84CC16')
ON CONFLICT DO NOTHING;

-- Create user badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text NOT NULL,
  badge_icon text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Create habit notes table
CREATE TABLE IF NOT EXISTS habit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_log_id uuid NOT NULL REFERENCES habit_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to habits table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE habits ADD COLUMN category_id uuid REFERENCES habit_categories(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE habits ADD COLUMN difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'priority_level'
  ) THEN
    ALTER TABLE habits ADD COLUMN priority_level text DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'reminder_time'
  ) THEN
    ALTER TABLE habits ADD COLUMN reminder_time time;
  END IF;
END $$;

-- Add notes column to habit_logs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habit_logs' AND column_name = 'notes'
  ) THEN
    ALTER TABLE habit_logs ADD COLUMN notes text;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE habit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habit_categories (public read access)
CREATE POLICY "Anyone can read habit categories"
  ON habit_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can read their own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for habit_notes
CREATE POLICY "Users can manage their own habit notes"
  ON habit_notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS habits_category_id_idx ON habits(category_id);
CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS habit_notes_habit_log_id_idx ON habit_notes(habit_log_id);
CREATE INDEX IF NOT EXISTS habit_notes_user_id_idx ON habit_notes(user_id);