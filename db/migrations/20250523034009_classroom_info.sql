-- +goose Up
-- +goose StatementBegin
ALTER TABLE classrooms 
    ADD COLUMN start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN end_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN course_code VARCHAR(16) NOT NULL,
    ADD COLUMN course_description TEXT,
    ADD COLUMN banner_image_index SMALLINT CHECK (banner_image_index >= 0);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE classrooms
    DROP COLUMN start_date,
    DROP COLUMN end_date,
    DROP COLUMN course_code,
    DROP COLUMN course_description,
    DROP COLUMN banner_image_index;
-- +goose StatementEnd
