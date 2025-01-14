-- +goose Up
-- +goose StatementBegin
CREATE TABLE assignments (
    id uuid PRIMARY KEY,
    classroom_id uuid NOT NULL REFERENCES classrooms(id),
    name VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    assignment_mode MODE NOT NULL,
    due_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE assignments;
-- +goose StatementEnd
