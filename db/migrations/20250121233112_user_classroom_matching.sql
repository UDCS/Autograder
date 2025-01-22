-- +goose Up
-- +goose StatementBegin
CREATE TABLE user_classroom_matching (
    user_id uuid NOT NULL,
    classroom_id uuid NOT NULL
); 
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE user_classroom_matching;
-- +goose StatementEnd
