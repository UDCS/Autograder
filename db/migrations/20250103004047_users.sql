-- +goose Up
-- +goose StatementBegin
CREATE TABLE users (
  id uuid PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  email VARCHAR(64) NOT NULL,
  password_hash VARCHAR(64) NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE users;
-- +goose StatementEnd
