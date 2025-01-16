-- +goose Up
-- +goose StatementBegin
CREATE TABLE invitations (
  id uuid PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  user_role USER_ROLE NOT NULL DEFAULT 'student',
  token_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE invitations;
-- +goose StatementEnd
