/*
  # Grant Service Role Direct Access to API Keys

  This migration ensures the service role (used by edge functions) can read
  from the api_keys table by granting direct SELECT permission, bypassing RLS.

  1. Changes
    - Grant SELECT permission on api_keys to service_role
  
  2. Security
    - Only service_role gets this access (edge functions)
    - Regular users still protected by RLS
    - Authenticated users can only see their own keys
*/

-- Grant direct SELECT access to service role (bypasses RLS)
GRANT SELECT ON api_keys TO service_role;

-- Also ensure the policy exists (belt and suspenders approach)
DROP POLICY IF EXISTS "Service role can read system API keys" ON api_keys;

CREATE POLICY "Service role can read system API keys"
  ON api_keys
  FOR SELECT
  TO service_role
  USING (true);
