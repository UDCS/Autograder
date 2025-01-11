-- +goose Up
-- +goose StatementBegin
CREATE TYPE MODE AS ENUM ('draft', 'edit', 'view');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TYPE IF EXISTS MODE;
-- +goose StatementEnd
