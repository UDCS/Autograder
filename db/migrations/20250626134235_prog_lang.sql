-- +goose Up
CREATE TYPE PROG_LANG AS ENUM ('racket', 'python', 'java');
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
