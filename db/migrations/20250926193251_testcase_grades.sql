-- +goose Up
-- +goose StatementBegin
DROP TABLE grades;
CREATE TABLE testcase_grades (
    testcase_id uuid NOT NULL REFERENCES testcases(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, testcase_id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE testcase_grades;
CREATE TABLE grades (
    question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd
