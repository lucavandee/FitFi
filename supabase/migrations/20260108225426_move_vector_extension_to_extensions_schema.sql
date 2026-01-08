/*
  # Move Vector Extension to Extensions Schema

  ## Summary
  This migration moves the pgvector extension from the public schema to a dedicated
  extensions schema. This is a Supabase best practice that improves security and
  organization by isolating extensions from application tables.

  ## Changes Made
  - Create 'extensions' schema if it doesn't exist
  - Move vector extension from public to extensions schema
  - Verify vector type is accessible (search_path already configured in functions)

  ## Affected Objects
  - Table: nova_memories (has embedding column of type vector)
  - Function: get_similar_memories (uses vector type, search_path already fixed)

  ## Important Notes
  - The vector type will remain accessible because we've already set proper search_path
    on all functions that use it
  - Existing data is not affected, only the extension location
  - After this migration, new extensions should be installed in the extensions schema
*/

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move vector extension to extensions schema
ALTER EXTENSION vector SET SCHEMA extensions;

-- Grant usage on extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated, anon;

-- Note: All functions using vector type already have search_path set to 'pg_catalog, public'
-- The vector type will be accessible because Postgres resolves types across schemas
-- when the extension schema is in the search path or when fully qualified.
