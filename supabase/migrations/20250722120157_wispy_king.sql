/*
  # Fix RLS Policies for User Badges

  1. Security Updates
    - Fix RLS policies for user_badges table to allow proper INSERT operations
    - Ensure authenticated users can insert their own badges
    - Add proper UPDATE policy for upsert operations

  2. Policy Changes
    - Update INSERT policy to use proper auth.uid() function
    - Add UPDATE policy for upsert functionality
    - Ensure policies work with the application's badge awarding system
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can read their own badges" ON user_badges;

-- Create proper RLS policies for user_badges
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

CREATE POLICY "Users can update their own badges"
  ON user_badges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);