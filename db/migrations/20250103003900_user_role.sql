-- +goose Up
-- +goose StatementBegin
CREATE TYPE USER_ROLE AS ENUM ('admin', 'instructor', 'assistant', 'student');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TYPE IF EXISTS USER_ROLE;
-- +goose StatementEnd
