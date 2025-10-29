/*
  # Disaster Scenario Questions for AI Self-Testing

  1. New Tables
    - `disaster_questions`
      - `id` (uuid, primary key) - Unique question identifier
      - `question` (text) - The realistic disaster question
      - `disaster_type` (text) - Type of disaster (psychological, shelter, fire, water, medical, etc.)
      - `urgency_level` (text) - immediate, urgent, important, routine
      - `complexity` (text) - simple, moderate, complex
      - `context` (text) - Scenario context that would lead to this question
      - `expected_topics` (text[]) - Array of topics the answer should cover
      - `source_document_id` (uuid) - Links to documents table
      - `times_tested` (integer) - How many times this question has been used for testing
      - `last_tested_at` (timestamptz) - Last time this question was tested
      - `created_at` (timestamptz) - Creation timestamp
      - `metadata` (jsonb) - Additional metadata

    - `question_test_results`
      - `id` (uuid, primary key) - Unique test result identifier
      - `question_id` (uuid, foreign key) - Reference to disaster_questions
      - `ai_response` (text) - The AI's actual response
      - `response_quality` (text) - poor, fair, good, excellent
      - `covered_topics` (text[]) - Topics that were actually covered
      - `missing_topics` (text[]) - Important topics that were missed
      - `response_time_ms` (integer) - How long it took to generate response
      - `knowledge_retrieved` (boolean) - Whether knowledge base was used
      - `tested_at` (timestamptz) - Test timestamp
      - `metadata` (jsonb) - Additional test metadata

  2. Security
    - Enable RLS on both tables
    - Public read access for questions (learning resource)
    - Service role write access for automated testing

  3. Indexes
    - Index on disaster_type for filtering
    - Index on urgency_level for prioritization
    - Index on times_tested for selecting undertested questions
    - Foreign key indexes

  4. Important Notes
    - Questions generated from analyzing knowledge base
    - Self-testing runs periodically to improve AI responses
    - Results track AI performance over time
*/

-- Create disaster_questions table
CREATE TABLE IF NOT EXISTS disaster_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  disaster_type text NOT NULL,
  urgency_level text NOT NULL CHECK (urgency_level IN ('immediate', 'urgent', 'important', 'routine')),
  complexity text NOT NULL CHECK (complexity IN ('simple', 'moderate', 'complex')),
  context text NOT NULL,
  expected_topics text[] DEFAULT ARRAY[]::text[],
  source_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  times_tested integer DEFAULT 0,
  last_tested_at timestamptz,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create question_test_results table
CREATE TABLE IF NOT EXISTS question_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES disaster_questions(id) ON DELETE CASCADE,
  ai_response text NOT NULL,
  response_quality text CHECK (response_quality IN ('poor', 'fair', 'good', 'excellent')),
  covered_topics text[] DEFAULT ARRAY[]::text[],
  missing_topics text[] DEFAULT ARRAY[]::text[],
  response_time_ms integer,
  knowledge_retrieved boolean DEFAULT false,
  tested_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE disaster_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_test_results ENABLE ROW LEVEL SECURITY;

-- Disaster questions policies: public read
CREATE POLICY "Anyone can view disaster questions"
  ON disaster_questions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage disaster questions"
  ON disaster_questions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Test results policies: service role only
CREATE POLICY "Service role can manage test results"
  ON question_test_results
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_disaster_questions_type
  ON disaster_questions(disaster_type);

CREATE INDEX IF NOT EXISTS idx_disaster_questions_urgency
  ON disaster_questions(urgency_level);

CREATE INDEX IF NOT EXISTS idx_disaster_questions_times_tested
  ON disaster_questions(times_tested);

CREATE INDEX IF NOT EXISTS idx_disaster_questions_created_at
  ON disaster_questions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_question_test_results_question_id
  ON question_test_results(question_id);

CREATE INDEX IF NOT EXISTS idx_question_test_results_tested_at
  ON question_test_results(tested_at DESC);

-- Function to get undertested questions
CREATE OR REPLACE FUNCTION get_undertested_questions(
  limit_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  question text,
  disaster_type text,
  urgency_level text,
  complexity text,
  times_tested integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dq.id,
    dq.question,
    dq.disaster_type,
    dq.urgency_level,
    dq.complexity,
    dq.times_tested
  FROM disaster_questions dq
  ORDER BY dq.times_tested ASC, random()
  LIMIT limit_count;
END;
$$;
