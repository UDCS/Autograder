-- +goose Up
-- +goose StatementBegin
CREATE TABLE users (
  id uuid PRIMARY KEY,
  first_name VARCHAR(32) NOT NULL,
  last_name VARCHAR(32) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  user_role USER_ROLE NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE users;
-- +goose StatementEnd
