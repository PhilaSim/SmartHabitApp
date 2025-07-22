/*
  # Fix RLS Policies for User Badges

  1. Security Updates
    - Update RLS policies for user_badges table to allow proper INSERT and UPDATE operations
    - Ensure users can create and read their own badges
    - Fix policy expressions to use correct Supabase auth functions

  2. Policy Changes
    - Allow authenticated users to insert their own badges
    - Allow authenticated users to read their own badges
    - Use auth.uid() function for proper user identification
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own badges" ON user_badges;
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