-- +goose Up
-- +goose StatementBegin
CREATE TABLE submissions (
    id uuid PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES users(id),
    assignment_id uuid NOT NULL REFERENCES assignments(id),
    question_id uuid NOT NULL REFERENCES questions(id),
    submitted_code TEXT NOT NULL,
    outputs JSONB NOT NULL, -- [ { "output": "3" }, {"output": "error" }, ... ]
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    grade INTEGER
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE submissions;
-- +goose StatementEnd
