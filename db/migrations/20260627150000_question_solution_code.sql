-- +goose Up
-- +goose StatementBegin
ALTER TABLE questions ADD COLUMN solution_code TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE questions DROP COLUMN solution_code;
-- +goose StatementEnd
