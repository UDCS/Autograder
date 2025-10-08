-- +goose Up
-- +goose StatementBegin
CREATE TABLE text_testcases (
    testcase_id uuid PRIMARY KEY NOT NULL REFERENCES testcases(id) ON DELETE CASCADE,
    inputs TEXT NOT NULL,
    outputs TEXT NOT NULL,
    hidden BOOLEAN NOT NULL DEFAULT TRUE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE text_testcases;
-- +goose StatementEnd
