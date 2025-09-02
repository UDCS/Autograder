-- +goose Up
-- +goose StatementBegin
CREATE TYPE TESTCASE_TYPE AS ENUM ('text', 'bash');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TYPE IF EXISTS TESTCASE_TYPE;
-- +goose StatementEnd
