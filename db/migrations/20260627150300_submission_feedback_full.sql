-- +goose Up
-- +goose StatementBegin
ALTER TABLE student_submissions ADD COLUMN feedback_full TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE student_submissions DROP COLUMN feedback_full;
-- +goose StatementEnd
