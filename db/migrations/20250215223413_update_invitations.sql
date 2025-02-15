-- +goose Up
-- +goose StatementBegin
ALTER TABLE invitations ADD COLUMN classroom_id uuid;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE invitations DROP COLUMN classroom_id;
-- +goose StatementEnd
