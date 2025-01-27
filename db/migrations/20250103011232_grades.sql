-- +goose Up
-- +goose StatementBegin
CREATE TABLE grades (
    id uuid PRIMARY KEY,
    assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE grades;
-- +goose StatementEnd
