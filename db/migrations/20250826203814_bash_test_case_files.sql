-- +goose Up
-- +goose StatementBegin
CREATE TABLE bash_testcase_files (
    id uuid PRIMARY KEY,
    testcase_id uuid NOT NULL REFERENCES testcases(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    suffix VARCHAR(32) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    primary_bash BOOLEAN NOT NULL DEFAULT FALSE
)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE bash_testcase_files;
-- +goose StatementEnd
