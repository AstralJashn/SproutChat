/*
  # Create API Keys Storage Table

  ## Purpose
  Store user API keys for external AI providers (OpenAI, Mistral, Groq) securely with encryption.

  ## Tables
  1. `api_keys`
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid) - Reference to auth.users
    - `provider` (text) - AI provider name (openai, mistral, groq)
    - `api_key` (text) - Encrypted API key
    - `model` (text) - Selected model name
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `api_keys` table
  - Users can only read/write their own API keys
  - API keys are stored as encrypted text

  ## Notes
  - Single row per user (upsert pattern)
  - Provider detected from key prefix
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  api_key text NOT NULL,
  model text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own API key"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API key"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API key"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API key"
  ON api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);