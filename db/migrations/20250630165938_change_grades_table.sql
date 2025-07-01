-- +goose Up
-- +goose StatementBegin
ALTER TABLE grades DROP COLUMN assignment_id;
ALTER TABLE grades ADD COLUMN question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE grades DROP COLUMN question_id;
ALTER TABLE grades ADD COLUMN assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE;
-- +goose StatementEnd
