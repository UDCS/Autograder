-- +goose Up
-- +goose StatementBegin
ALTER TABLE questions 
    ADD COLUMN prog_lang PROG_LANG NOT NULL,
    ADD COLUMN default_code TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE questions
    DROP COLUMN prog_lang,
    DROP COLUMN default_code;
-- +goose StatementEnd
