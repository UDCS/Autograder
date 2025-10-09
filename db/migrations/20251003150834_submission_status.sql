-- +goose Up
-- +goose StatementBegin
CREATE TYPE SUBMISSION_STATUS AS ENUM ('running', 'failed', 'partial', 'passed', 'error');
ALTER TABLE student_submissions 
    ADD COLUMN status SUBMISSION_STATUS NOT NULL DEFAULT 'failed',
    ADD COLUMN feedback TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE student_submissions 
    DROP COLUMN status,
    DROP COLUMN feedback;
DROP TYPE IF EXISTS SUBMISSION_STATUS;
-- +goose StatementEnd
