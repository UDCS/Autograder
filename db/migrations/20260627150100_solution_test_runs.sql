-- +goose Up
-- +goose StatementBegin
CREATE TABLE solution_test_runs (
    id uuid PRIMARY KEY,
    question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    status SUBMISSION_STATUS NOT NULL DEFAULT 'running',
    results JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE solution_test_runs;
-- +goose StatementEnd
