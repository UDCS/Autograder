-- +goose Up
-- +goose StatementBegin
ALTER TABLE questions
    DROP COLUMN points,
    DROP COLUMN testcases,
    DROP COLUMN settings;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE questions
    ADD COLUMN points INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN testcases JSONB NOT NULL DEFAULT '{}'::JSONB, -- [ { "output": "3+", visible: true }, { "output": "5*", visible: false } ]
    ADD COLUMN settings JSONB NOT NULL DEFAULT '{}'::JSONB; -- { "language": "java", "timeout": 1000, "memory": 256, "base_code": "..." };
-- +goose StatementEnd
