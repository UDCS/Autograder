-- +goose Up
-- +goose StatementBegin
ALTER TABLE invitations DROP COLUMN classroom_id;
CREATE TABLE future_student_classroom_matching (
    email VARCHAR(254) NOT NULL,
    classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    role USER_ROLE NOT NULL DEFAULT 'student',
    PRIMARY KEY (email, classroom_id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE invitations ADD COLUMN classroom_id uuid;
DROP TABLE IF EXISTS future_student_classroom_matching;
-- +goose StatementEnd
