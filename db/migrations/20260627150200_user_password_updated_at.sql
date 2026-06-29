-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN password_updated_at TIMESTAMP NOT NULL DEFAULT NOW();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN password_updated_at;
-- +goose StatementEnd
