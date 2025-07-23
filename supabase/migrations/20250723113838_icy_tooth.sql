/*
  # Test Management System Schema

  1. New Tables
    - `test_questions` - Junction table linking tests to questions
    - Updates to existing tables for proper relationships
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
  
  3. Changes
    - Add proper foreign key relationships
    - Add indexes for performance
*/

-- Create test_questions junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(test_id, question_id)
);

-- Add missing columns to tests table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tests' AND column_name = 'duration'
  ) THEN
    ALTER TABLE tests ADD COLUMN duration integer DEFAULT 60;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tests' AND column_name = 'is_live'
  ) THEN
    ALTER TABLE tests ADD COLUMN is_live boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tests' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE tests ADD COLUMN expires_at timestamptz;
  END IF;
END $$;

-- Add missing columns to questions table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'test_cases'
  ) THEN
    ALTER TABLE questions ADD COLUMN test_cases jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'source'
  ) THEN
    ALTER TABLE questions ADD COLUMN source text DEFAULT 'custom';
  END IF;
END $$;

-- Enable RLS on test_questions
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for test_questions
CREATE POLICY "Anyone can read test questions"
  ON test_questions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage test questions"
  ON test_questions
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_question_id ON test_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_tests_code ON tests(code);
CREATE INDEX IF NOT EXISTS idx_tests_is_live ON tests(is_live);

-- Update existing policies if needed
DROP POLICY IF EXISTS "Anyone can read tests" ON tests;
CREATE POLICY "Anyone can read tests"
  ON tests
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage tests" ON tests;
CREATE POLICY "Authenticated users can manage tests"
  ON tests
  FOR ALL
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can read questions" ON questions;
CREATE POLICY "Anyone can read questions"
  ON questions
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage questions" ON questions;
CREATE POLICY "Authenticated users can manage questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (true);