-- +goose Up
-- +goose StatementBegin
CREATE TABLE testcases (
    id uuid PRIMARY KEY,
    name VARCHAR(64),
    question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    type TESTCASE_TYPE NOT NULL,
    points INTEGER NOT NULL CHECK (points >= 1),
    timeout_seconds INTEGER NOT NULL CHECK (timeout_seconds >= 1)  
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE testcases;
-- +goose StatementEnd
