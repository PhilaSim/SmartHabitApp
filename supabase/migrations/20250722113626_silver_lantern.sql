/*
  # Create habits and habit_logs tables

  1. New Tables
    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `habit_name` (text)
      - `created_at` (timestamp)
    - `habit_logs`
      - `id` (uuid, primary key)  
      - `habit_id` (uuid, foreign key to habits)
      - `date` (date)
      - `completed` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Users can only access habits and logs they own

  3. Indexes
    - Add indexes for efficient querying by user_id and date
*/

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, date)
);

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for habits table
CREATE POLICY "Users can manage their own habits"
  ON habits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for habit_logs table  
CREATE POLICY "Users can manage their own habit logs"
  ON habit_logs
  FOR ALL
  TO authenticated
  USING (
    habit_id IN (
      SELECT id FROM habits WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    habit_id IN (
      SELECT id FROM habits WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habit_logs_habit_id_idx ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS habit_logs_date_idx ON habit_logs(date);