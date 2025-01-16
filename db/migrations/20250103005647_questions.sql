-- +goose Up
-- +goose StatementBegin
CREATE TABLE questions (
    id uuid PRIMARY KEY,
    assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    header VARCHAR(32) NOT NULL,
    body TEXT NOT NULL,
    points INTEGER NOT NULL,
    testcases JSONB NOT NULL, -- [ { "output": "3+", visible: true }, { "output": "5*", visible: false } ]
    settings JSONB NOT NULL, -- { "language": "java", "timeout": 1000, "memory": 256, "base_code": "..." }
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE questions;
-- +goose StatementEnd
