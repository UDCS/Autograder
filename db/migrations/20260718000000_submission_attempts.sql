-- +goose Up
-- +goose StatementBegin
CREATE TABLE submission_attempts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id),
    question_id  UUID NOT NULL REFERENCES questions(id),
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    score        INT NOT NULL DEFAULT 0,
    status       SUBMISSION_STATUS NOT NULL DEFAULT 'failed'
);
CREATE INDEX idx_submission_attempts_user_question ON submission_attempts (user_id, question_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE submission_attempts;
-- +goose StatementEnd
