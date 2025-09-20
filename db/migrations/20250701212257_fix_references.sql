-- +goose Up
-- +goose StatementBegin
ALTER TABLE user_classroom_matching 
    ADD CONSTRAINT user_classroom_matching_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    ADD CONSTRAINT user_classroom_matching_classroom_id_fkey
        FOREIGN KEY (classroom_id)
        REFERENCES classrooms(id)
        ON DELETE CASCADE;

ALTER TABLE invitations
    ADD CONSTRAINT invitations_classroom_id_fkey
        FOREIGN KEY (classroom_id)
        REFERENCES classrooms(id)
        ON DELETE SET NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE user_classroom_matching
    DROP CONSTRAINT user_classroom_matching_user_id_fkey,
    DROP CONSTRAINT user_classroom_matching_classroom_id_fkey;

ALTER TABLE invitations
    DROP CONSTRAINT invitations_classroom_id_fkey;
-- +goose StatementEnd
