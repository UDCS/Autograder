-- +goose Up
-- +goose StatementBegin
CREATE TABLE classrooms (
    id uuid PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE classrooms;
-- +goose StatementEnd
