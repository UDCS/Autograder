-- +goose Up
-- +goose StatementBegin
-- Convert every naive TIMESTAMP column to TIMESTAMPTZ so stored times are real
-- instants that no longer depend on the server's OS timezone. Existing naive
-- values were written as app-local (America/Chicago) wall-clock, so interpret
-- them in that zone during this one-time conversion. goose's own bookkeeping
-- table is left untouched.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND data_type = 'timestamp without time zone'
      AND table_name <> 'goose_db_version'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE %L',
      r.table_name, r.column_name, r.column_name, 'America/Chicago'
    );
  END LOOP;
END $$;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND data_type = 'timestamp with time zone'
      AND table_name <> 'goose_db_version'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I ALTER COLUMN %I TYPE timestamp USING %I AT TIME ZONE %L',
      r.table_name, r.column_name, r.column_name, 'America/Chicago'
    );
  END LOOP;
END $$;
-- +goose StatementEnd
