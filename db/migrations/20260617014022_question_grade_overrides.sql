-- +goose Up
-- +goose StatementBegin
CREATE TABLE question_grade_overrides (
    question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_manual_grade BOOLEAN NOT NULL,
    new_grade INTEGER,
    UNIQUE (student_id, question_id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS question_grade_overrides;
-- +goose StatementEnd
