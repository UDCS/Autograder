-- +goose Up
-- +goose StatementBegin
CREATE TABLE sessions (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(254) NOT NULL,
    user_role USER_ROLE NOT NULL DEFAULT 'student',
    token_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL  DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE sessions;
-- +goose StatementEnd
