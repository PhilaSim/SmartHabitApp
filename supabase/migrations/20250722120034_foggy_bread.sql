/*
  # Fix Missing Database Tables and Relationships

  1. New Tables
    - `habit_categories` - Predefined categories for organizing habits
    - `user_badges` - Achievement badges earned by users
    - `habit_notes` - Optional notes for habit completions
  
  2. Table Updates
    - Add `category_id` foreign key to `habits` table
    - Add `difficulty_level`, `priority_level`, `reminder_time` columns to `habits`
    - Add `notes` column to `habit_logs` table
  
  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data access
  
  4. Sample Data
    - Insert default habit categories with icons and colors
*/

-- Create habit_categories table
CREATE TABLE IF NOT EXISTS habit_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE habit_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read habit categories"
  ON habit_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text NOT NULL,
  badge_icon text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE (user_id, badge_type)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

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

-- Create habit_notes table
CREATE TABLE IF NOT EXISTS habit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_log_id uuid NOT NULL,
  user_id uuid NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE habit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own habit notes"
  ON habit_notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add missing columns to habits table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE habits ADD COLUMN category_id uuid;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'difficulty_level'
  ) THEN
    ALTER TABLE habits ADD COLUMN difficulty_level text DEFAULT 'medium';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'priority_level'
  ) THEN
    ALTER TABLE habits ADD COLUMN priority_level text DEFAULT 'medium';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'reminder_time'
  ) THEN
    ALTER TABLE habits ADD COLUMN reminder_time time;
  END IF;
END $$;

-- Add missing columns to habit_logs table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habit_logs' AND column_name = 'notes'
  ) THEN
    ALTER TABLE habit_logs ADD COLUMN notes text;
  END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'habits_category_id_fkey'
  ) THEN
    ALTER TABLE habits ADD CONSTRAINT habits_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES habit_categories(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_badges_user_id_fkey'
  ) THEN
    ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'habit_notes_habit_log_id_fkey'
  ) THEN
    ALTER TABLE habit_notes ADD CONSTRAINT habit_notes_habit_log_id_fkey 
    FOREIGN KEY (habit_log_id) REFERENCES habit_logs(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'habit_notes_user_id_fkey'
  ) THEN
    ALTER TABLE habit_notes ADD CONSTRAINT habit_notes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraints for difficulty and priority levels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'habits_difficulty_level_check'
  ) THEN
    ALTER TABLE habits ADD CONSTRAINT habits_difficulty_level_check 
    CHECK (difficulty_level IN ('easy', 'medium', 'hard'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'habits_priority_level_check'
  ) THEN
    ALTER TABLE habits ADD CONSTRAINT habits_priority_level_check 
    CHECK (priority_level IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habits_category_id_idx ON habits(category_id);
CREATE INDEX IF NOT EXISTS habit_logs_habit_id_idx ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS habit_logs_date_idx ON habit_logs(date);
CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS habit_notes_habit_log_id_idx ON habit_notes(habit_log_id);
CREATE INDEX IF NOT EXISTS habit_notes_user_id_idx ON habit_notes(user_id);

-- Insert default habit categories
INSERT INTO habit_categories (name, icon, color) VALUES
  ('Health', '🏥', '#10B981'),
  ('Fitness', '💪', '#F59E0B'),
  ('Learning', '📚', '#3B82F6'),
  ('Productivity', '⚡', '#8B5CF6'),
  ('Mindfulness', '🧘', '#06B6D4'),
  ('Social', '👥', '#EC4899'),
  ('Creative', '🎨', '#F97316'),
  ('Other', '📝', '#6B7280')
ON CONFLICT DO NOTHING;