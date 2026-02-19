/*
  # BU GAMERS - Complete Database Schema

  ## New Tables
  
  ### 1. `user_profiles`
  - `id` (uuid, FK to auth.users)
  - `username` (text, unique)
  - `enrollment_number` (text, unique)
  - `email` (text)
  - `batch` (text) - e.g., "2024"
  - `course` (text) - e.g., "CSE", "ECE"
  - `total_buxp` (integer) - Bennett XP currency
  - `avatar_data` (jsonb) - Avatar customization
  - `theme_preference` (text) - "light" or "dark"
  - `is_admin` (boolean)
  - `created_at` (timestamptz)
  - `last_login` (timestamptz)

  ### 2. `games`
  - `id` (uuid)
  - `name` (text)
  - `slug` (text, unique)
  - `description` (text)
  - `difficulty` (text) - "Easy", "Medium", "Hard"
  - `category` (text) - "Casual", "Strategy", "Competitive"
  - `image_url` (text)
  - `buxp_reward` (integer) - BUXP per win
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 3. `game_scores`
  - `id` (uuid)
  - `user_id` (uuid, FK)
  - `game_id` (uuid, FK)
  - `score` (integer)
  - `buxp_earned` (integer)
  - `played_at` (timestamptz)

  ### 4. `leaderboard`
  - `id` (uuid)
  - `user_id` (uuid, FK)
  - `game_id` (uuid, FK)
  - `best_score` (integer)
  - `total_plays` (integer)
  - `total_wins` (integer)
  - `global_rank` (integer)
  - `university_rank` (integer)
  - `updated_at` (timestamptz)

  ### 5. `achievements`
  - `id` (uuid)
  - `name` (text)
  - `description` (text)
  - `badge_icon` (text)
  - `buxp_reward` (integer)
  - `requirement_type` (text) - "wins", "score", "streak"
  - `requirement_value` (integer)

  ### 6. `user_achievements`
  - `id` (uuid)
  - `user_id` (uuid, FK)
  - `achievement_id` (uuid, FK)
  - `earned_at` (timestamptz)

  ### 7. `currency_transactions`
  - `id` (uuid)
  - `user_id` (uuid, FK)
  - `amount` (integer)
  - `transaction_type` (text) - "earn", "spend"
  - `source` (text) - "game_win", "achievement", "daily_login"
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies for authenticated users to manage their own data
  - Admin-only policies for games and achievements management
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  enrollment_number text UNIQUE NOT NULL,
  email text NOT NULL,
  batch text NOT NULL,
  course text NOT NULL,
  total_buxp integer DEFAULT 0,
  avatar_data jsonb DEFAULT '{"hair": "style1", "skin": "tone1", "clothes": "outfit1"}'::jsonb,
  theme_preference text DEFAULT 'dark',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  buxp_reward integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active games"
  ON games FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Only admins can manage games"
  ON games FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create game_scores table
CREATE TABLE IF NOT EXISTS game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  buxp_earned integer DEFAULT 0,
  played_at timestamptz DEFAULT now()
);

ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all scores"
  ON game_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own scores"
  ON game_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  best_score integer DEFAULT 0,
  total_plays integer DEFAULT 0,
  total_wins integer DEFAULT 0,
  global_rank integer DEFAULT 0,
  university_rank integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own leaderboard"
  ON leaderboard FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own leaderboard"
  ON leaderboard FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  badge_icon text NOT NULL,
  buxp_reward integer DEFAULT 50,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage achievements"
  ON achievements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can earn achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create currency_transactions table
CREATE TABLE IF NOT EXISTS currency_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  transaction_type text NOT NULL,
  source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE currency_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON currency_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON currency_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_id ON leaderboard(game_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_global_rank ON leaderboard(global_rank);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);