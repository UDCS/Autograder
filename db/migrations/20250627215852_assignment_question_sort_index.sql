-- +goose Up
-- +goose StatementBegin
ALTER TABLE assignments ADD COLUMN sort_index INTEGER NOT NULL;
ALTER TABLE questions ADD COLUMN sort_index INTEGER NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE assignments DROP COLUMN sort_index;
ALTER TABLE questions DROP COLUMN sort_index;
-- +goose StatementEnd
