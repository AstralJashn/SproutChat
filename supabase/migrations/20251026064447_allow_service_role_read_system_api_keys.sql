/*
  # Allow Service Role to Read System-Wide API Keys

  This migration adds a policy to allow the service role (used by edge functions)
  to read system-wide API keys where user_id IS NULL.

  1. Changes
    - Add policy for service role to read system-wide API keys (user_id IS NULL)
  
  2. Security
    - Only allows reading when user_id IS NULL (system-wide keys)
    - Regular users cannot read system keys
    - Service role can access for edge function usage
*/

-- Drop the restrictive policies and recreate with service role access
DROP POLICY IF EXISTS "Users can read own API key" ON api_keys;

-- Allow users to read their own keys
CREATE POLICY "Users can read own API key"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow service role to read system-wide keys (user_id IS NULL)
CREATE POLICY "Service role can read system API keys"
  ON api_keys
  FOR SELECT
  TO service_role
  USING (user_id IS NULL);
