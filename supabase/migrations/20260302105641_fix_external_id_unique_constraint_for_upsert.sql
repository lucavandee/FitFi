/*
  # Fix external_id unique constraint for upsert support

  The existing unique index on products.external_id is a partial index
  (WHERE external_id IS NOT NULL), which Postgres does not support for
  ON CONFLICT upserts. This migration replaces it with a full unique
  constraint so the Daisycon import edge function can upsert correctly.

  Changes:
  - Drop the partial unique index products_external_id_unique
  - Add a full unique constraint on external_id (NULLs are still allowed;
    multiple NULLs are permitted because NULL != NULL in Postgres)
*/

DROP INDEX IF EXISTS products_external_id_unique;

ALTER TABLE products
  ADD CONSTRAINT products_external_id_key UNIQUE (external_id);
