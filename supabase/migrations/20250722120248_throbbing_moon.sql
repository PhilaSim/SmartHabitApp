/*
  # Fix User Badges RLS Policies

  1. Security
    - Drop existing policies that may be incorrectly configured
    - Create proper RLS policies for user_badges table
    - Allow authenticated users to insert, update, and select their own badges
    - Use auth.uid() to match user_id for proper security
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can update their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can read their own badges" ON user_badges;

-- Create proper RLS policies for user_badges
CREATE POLICY "Users can insert their own badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own badges"
  ON user_badges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);