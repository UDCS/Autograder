-- +goose Up
-- +goose StatementBegin
ALTER TABLE grades RENAME COLUMN assignment_id TO question_id;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE grades RENAME COLUMN question_id TO assignment_id;
-- +goose StatementEnd
