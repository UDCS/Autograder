-- +goose Up
-- +goose StatementBegin
CREATE TABLE invitations (
  id uuid PRIMARY KEY,
  email VARCHAR(64) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE invitations;
-- +goose StatementEnd
