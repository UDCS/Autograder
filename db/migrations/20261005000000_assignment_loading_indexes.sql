-- +goose Up
-- +goose StatementBegin
CREATE INDEX idx_assignments_classroom_mode_sort
    ON assignments (classroom_id, assignment_mode, sort_index);

CREATE INDEX idx_questions_assignment_sort
    ON questions (assignment_id, sort_index);

CREATE INDEX idx_testcases_question
    ON testcases (question_id);

CREATE INDEX idx_bash_testcase_files_testcase
    ON bash_testcase_files (testcase_id, primary_bash);

-- The application treats these relationships as one-to-one. These unique
-- indexes also make their most common lookup paths efficient. If this
-- migration finds legacy duplicates, it fails without deleting any data so
-- the duplicate records can be reviewed explicitly before retrying.
CREATE UNIQUE INDEX idx_student_submissions_user_question
    ON student_submissions (user_id, question_id);

CREATE UNIQUE INDEX idx_user_classroom_matching_user_classroom
    ON user_classroom_matching (user_id, classroom_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_user_classroom_matching_user_classroom;
DROP INDEX IF EXISTS idx_student_submissions_user_question;
DROP INDEX IF EXISTS idx_bash_testcase_files_testcase;
DROP INDEX IF EXISTS idx_testcases_question;
DROP INDEX IF EXISTS idx_questions_assignment_sort;
DROP INDEX IF EXISTS idx_assignments_classroom_mode_sort;
-- +goose StatementEnd
