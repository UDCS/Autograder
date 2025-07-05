-- +goose Up
-- +goose StatementBegin
CREATE TYPE PROG_LANG AS ENUM ('racket', 'java', 'python', 'c');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TYPE IF EXISTS PROG_LANG;
-- +goose StatementEnd
