package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"sort"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

func (store PostgresStore) CreateClassroom(classroom models.Classroom) (*models.Classroom, error) {
	var createdClassroom models.Classroom
	err := store.db.QueryRowx(
		"INSERT INTO classrooms (id, name, created_at, updated_at, start_date, end_date, course_code, course_description, banner_image_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, created_at, updated_at, start_date, end_date, course_code, course_description, banner_image_index;",
		classroom.Id, classroom.Name, classroom.CreatedAt, classroom.UpdatedAt, classroom.StartDate, classroom.EndDate, classroom.CourseCode, classroom.CourseDescription, classroom.BannerImageIndex,
	).StructScan(&createdClassroom)

	if err != nil {
		return nil, err
	}
	return &createdClassroom, nil
}

func (store PostgresStore) GetClassroomInfo(classroomId uuid.UUID) (models.Classroom, error) {
	var classroom models.Classroom
	err := store.db.QueryRowx(
		"SELECT id, name, created_at, updated_at, start_date, end_date, course_code, course_description, banner_image_index FROM classrooms WHERE id=$1", classroomId,
	).StructScan(&classroom)
	if err != nil {
		return models.Classroom{}, fmt.Errorf("classroom not found")
	}
	return classroom, nil
}

func (store PostgresStore) MatchUserToClassroom(email string, role string, classroomId uuid.UUID) error {
	userInfo, err := store.GetUserInfo(email)
	if err != nil {
		return err
	}

	var classroomPair models.UserInClassroom
	classroomPair, err = store.GetUserClassroomInfo(userInfo.Id, classroomId)
	if err == nil {
		if classroomPair.UserRole != models.UserRole(role) {
			_, err = store.db.Exec(
				"UPDATE user_classroom_matching SET user_role = $3 WHERE user_id = $1 AND classroom_id = $2;",
				classroomPair.UserId, classroomPair.ClassroomId, role,
			)
			if err != nil {
				return err
			}
		}
		return nil
	}
	_, err = store.db.Exec("INSERT INTO user_classroom_matching (user_id, user_role, classroom_id) VALUES ($1, $2, $3)", userInfo.Id, role, classroomId)
	if err != nil {
		return err
	}
	return nil
}

func (store PostgresStore) MatchFutureUserToClassroom(email string, classroomId uuid.UUID, role models.UserRole) error {
	// "INSERT INTO assignments (id, classroom_id, name, description, assignment_mode, due_at,  updated_at, sort_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET name = $3, description=$4, assignment_mode=$5, due_at = $6, updated_at=$7, sort_index=$8;",
	_, err := store.db.Exec(
		"INSERT INTO future_student_classroom_matching (email, classroom_id, role) VALUES ($1, $2, $3) ON CONFLICT (email, classroom_id) DO UPDATE SET role = $3",
		email, classroomId, role,
	)
	return err
}

func (store PostgresStore) RemoveFutureClassroomMatching(email string) {
	_, _ = store.db.Exec(
		"DELETE FROM future_student_classroom_matching WHERE email = $1",
		email,
	)
}

func (store PostgresStore) GetInviteClassrooms(email string) (*[]models.FutureStudentClassroomMatching, error) {
	var classrooms []models.FutureStudentClassroomMatching
	fmt.Printf("Email: %s\n", email)
	err := store.db.Select(
		&classrooms,
		"SELECT classroom_id, role FROM future_student_classroom_matching WHERE email=$1",
		email,
	)
	if err != nil {
		fmt.Println(err.Error())
	}
	return &classrooms, err
}

func (store PostgresStore) GetUserClassroomInfo(userId uuid.UUID, classroomId uuid.UUID) (models.UserInClassroom, error) {

	var user models.UserInClassroom

	err := store.db.QueryRowx(
		"SELECT user_id, classroom_id, user_role FROM user_classroom_matching WHERE user_id=$1 AND classroom_id=$2",
		userId, classroomId,
	).StructScan(&user)

	if err != nil {
		return models.UserInClassroom{}, err
	}

	return user, nil

}

func (store PostgresStore) GetFutureUserClassroomInfo(email string, classroomId uuid.UUID) (models.UserInClassroom, error) {
	var user models.UserInClassroom

	err := store.db.Get(
		&user,
		"SELECT email, classroom_id, role AS user_role FROM future_student_classroom_matching WHERE email = $1 AND classroom_id = $2",
		email, classroomId,
	)

	return user, err
}

func (store PostgresStore) GetQuestionPoints(questionId uuid.UUID) (uint16, error) {
	var points uint16
	err := store.db.Get(
		&points,
		"SELECT COALESCE(SUM(points), 0) AS total_points FROM testcases WHERE question_id = $1;",
		questionId,
	)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return points, err
	}
	return points, nil
}

func (store PostgresStore) GetStudentQuestionGrade(userId uuid.UUID, questionId uuid.UUID) (uint16, error) {
	var grade uint16 = 0
	testcases, err := store.GetQuestionTestcases(questionId)
	if err != nil {
		return 0, err
	}
	for _, testcase := range testcases {
		testcaseId := testcase.Id
		var gradeAtTestcase uint16
		_ = store.db.Get(
			&gradeAtTestcase,
			"SELECT score FROM testcase_grades WHERE student_id=$1 AND testcase_id=$2",
			userId, testcaseId,
		)
		grade += gradeAtTestcase
	}
	return grade, nil
}

func (store PostgresStore) UserOwnsSubmission(userId uuid.UUID, submissionId uuid.UUID) bool {
	var owns bool
	store.db.Get(
		&owns,
		"SELECT EXISTS (SELECT 1 FROM student_submissions WHERE user_id=$1 AND id=$2)",
		userId, submissionId,
	)
	return owns
}

func (store PostgresStore) GetSubmissionId(userId uuid.UUID, questionId uuid.UUID) (uuid.UUID, error) {
	var submissionId uuid.UUID
	err := store.db.Get(
		&submissionId,
		"SELECT id from student_submissions WHERE user_id=$1 AND question_id=$2",
		userId, questionId,
	)
	if err != nil {
		return uuid.UUID{}, err
	}
	return submissionId, nil
}

func (store PostgresStore) GetQuestionInfo(questionId uuid.UUID) (models.Question, error) {
	var question models.Question
	err := store.db.Get(
		&question,
		"SELECT id, assignment_id, header, body, created_at, updated_at, sort_index, prog_lang, default_code FROM questions WHERE id = $1;",
		questionId,
	)
	if err != nil {
		return models.Question{}, err
	}
	return question, nil
}

func (store PostgresStore) GetTestcaseInfo(testcaseId uuid.UUID) (models.Testcase, error) {
	var testcase models.Testcase
	err := store.db.Get(
		&testcase,
		"SELECT id, question_id, name, type, points, timeout_seconds FROM testcases WHERE id = $1;",
		testcaseId,
	)
	if err != nil {
		return models.Testcase{}, err
	}
	return testcase, nil

}

func (store PostgresStore) GetViewAssignments(userId uuid.UUID, classroomId uuid.UUID) ([]models.Assignment, error) {
	var assignments []models.Assignment
	err := store.db.Select(
		&assignments,
		"SELECT id, classroom_id, name, description, assignment_mode, due_at, created_at, updated_at, sort_index FROM assignments WHERE classroom_id = $1 AND assignment_mode = 'view';",
		classroomId,
	)
	if err != nil {
		return []models.Assignment{}, err
	}
	sort.Slice(assignments, func(i int, j int) bool {
		return assignments[i].SortIndex < assignments[j].SortIndex
	})
	for assignmentIndex := 0; assignmentIndex < len(assignments); assignmentIndex++ {
		var questions []models.Question
		err = store.db.Select(
			&questions,
			"SELECT id, assignment_id, header, body, prog_lang, sort_index FROM questions WHERE assignment_id = $1;",
			assignments[assignmentIndex].Id,
		)
		if err != nil {
			return []models.Assignment{}, err
		}
		for questionIndex := range questions {
			questionId := questions[questionIndex].Id
			score, err := store.GetStudentQuestionGrade(userId, questionId)
			if err != nil && !errors.Is(err, sql.ErrNoRows) {
				return []models.Assignment{}, err
			}
			points, err := store.GetQuestionPoints(questionId)
			if err != nil {
				return []models.Assignment{}, err
			}
			questions[questionIndex].Points = points
			questions[questionIndex].Score = score
			var submissionInfo struct {
				Id       uuid.UUID `db:"id"`
				Status   string    `db:"status"`
				Feedback string    `db:"feedback"`
			}
			if subErr := store.db.Get(&submissionInfo,
				"SELECT id, status, feedback FROM student_submissions WHERE user_id=$1 AND question_id=$2",
				userId, questionId,
			); subErr == nil {
				questions[questionIndex].SubmissionId = &submissionInfo.Id
				questions[questionIndex].SubmissionStatus = submissionInfo.Status
				questions[questionIndex].ConsoleOutput = submissionInfo.Feedback
			}
		}
		sort.Slice(questions, func(i int, j int) bool {
			return questions[i].SortIndex < questions[j].SortIndex
		})
		assignments[assignmentIndex].Questions = questions
	}

	return assignments, nil
}

func (store PostgresStore) GetVerboseAssignments(userId uuid.UUID, classroomId uuid.UUID) ([]models.Assignment, error) {
	var assignments []models.Assignment
	err := store.db.Select(
		&assignments,
		"SELECT id, classroom_id, name, description, assignment_mode, due_at, created_at, updated_at, sort_index FROM assignments WHERE classroom_id = $1;",
		classroomId,
	)
	if err != nil {
		return []models.Assignment{}, err
	}
	sort.Slice(assignments, func(i int, j int) bool {
		return assignments[i].SortIndex < assignments[j].SortIndex
	})
	for assignmentIndex := 0; assignmentIndex < len(assignments); assignmentIndex++ {
		var questions []models.Question
		err = store.db.Select(
			&questions,
			"SELECT id, assignment_id, header, body, prog_lang, default_code, solution_code, sort_index FROM questions WHERE assignment_id = $1;",
			assignments[assignmentIndex].Id,
		)
		if err != nil {
			return []models.Assignment{}, err
		}
		for questionIndex := range questions {
			question := &questions[questionIndex]
			questionId := question.Id
			testcases, err := store.GetQuestionTestcases(questionId)
			if err != nil {
				return []models.Assignment{}, err
			}
			points, err := store.GetQuestionPoints(questionId)
			if err != nil {
				return []models.Assignment{}, err
			}
			score, err := store.GetStudentQuestionGrade(userId, questionId)
			if err != nil {
				return []models.Assignment{}, err
			}
			question.Testcases = testcases
			question.Points = points
			question.Score = score
		}
		sort.Slice(questions, func(i int, j int) bool {
			return questions[i].SortIndex < questions[j].SortIndex
		})
		assignments[assignmentIndex].Questions = questions
	}

	return assignments, nil
}

func (store PostgresStore) GetClassroomStudents(classroomId uuid.UUID) ([]models.UserInClassroom, error) {
	var students []models.UserInClassroom

	err := store.db.Select(
		&students,
		"SELECT email, role AS user_role FROM future_student_classroom_matching WHERE classroom_id = $1",
		classroomId,
	)
	if err != nil {
		return []models.UserInClassroom{}, err
	}

	newListOfStudents := make([]models.UserInClassroom, 0)
	for _, student := range students {
		student.State = models.Unregistered
		student.UserId = uuid.New()
		student.ClassroomId = classroomId
		_, err := store.GetUserInfo(student.Email)
		userExists := err == nil
		if userExists {
			continue
		}
		newListOfStudents = append(newListOfStudents, student)
	}
	students = newListOfStudents

	var studentsInClassroom []struct {
		UserId   uuid.UUID       `db:"user_id"`
		UserRole models.UserRole `db:"user_role"`
	}

	err = store.db.Select(
		&studentsInClassroom,
		"SELECT user_id, user_role FROM user_classroom_matching WHERE classroom_id = $1",
		classroomId,
	)

	if err != nil {
		return []models.UserInClassroom{}, err
	}

	for _, studentId := range studentsInClassroom {
		var user models.UserInClassroom
		user.ClassroomId = classroomId
		user.UserRole = studentId.UserRole
		_ = store.db.Get(
			&user,
			"SELECT first_name, last_name, email, id AS user_id FROM users WHERE id = $1",
			studentId.UserId,
		)
		user.State = models.Registered
		addTo := true
		for index, alreadyStudent := range students {
			if alreadyStudent.Email == user.Email {
				students[index] = user
				addTo = false
				break
			}
		}
		if addTo {
			students = append(students, user)
		}
	}

	return students, nil
}

func (store PostgresStore) DeleteClassroomStudent(classroomId uuid.UUID, user models.UserInClassroom) error {
	userEmail := user.Email

	userInfo, err := store.GetUserInfo(userEmail)
	userRegistered := err == nil

	if userRegistered {
		_, _ = store.db.Exec(
			"DELETE FROM user_classroom_matching WHERE user_id = $1 AND classroom_id = $2",
			userInfo.Id, classroomId,
		)
	} else {
		_, _ = store.db.Exec(
			"DELETE FROM future_student_classroom_matching WHERE email = $1 AND classroom_id = $2",
			userEmail, classroomId,
		)
	}
	return nil
}

func (store PostgresStore) SetVerboseAssignment(assignment models.Assignment) error {
	_, err := store.db.Exec(
		"INSERT INTO assignments (id, classroom_id, name, description, assignment_mode, due_at,  updated_at, sort_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET name = $3, description=$4, assignment_mode=$5, due_at = $6, updated_at=$7, sort_index=$8;",
		assignment.Id, assignment.ClassroomId, assignment.Name, assignment.Description, assignment.AssignmentMode, assignment.DueAt, time.Now(), assignment.SortIndex,
	)
	if err != nil {
		return err
	}
	for _, question := range assignment.Questions {
		_, err := store.db.Exec(
			"INSERT INTO questions (id, assignment_id, header, body, prog_lang, updated_at, sort_index, default_code, solution_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET header = $3, body=$4, prog_lang=$5, updated_at=$6, sort_index=$7, default_code = $8, solution_code = $9;",
			question.Id, question.AssignmentId, question.Header, question.Body, question.ProgrammingLanguage, time.Now(), question.SortIndex, question.DefaultCode, question.SolutionCode,
		)
		if err != nil {
			return err
		}
		for _, testCase := range question.Testcases {
			_, err = store.db.Exec("INSERT INTO testcases (id, question_id, name, type, points, timeout_seconds) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET name=$3, points=$5, timeout_seconds=$6;",
				testCase.Id, testCase.QuestionId, testCase.Name, testCase.Type, testCase.Points, testCase.TimeoutSeconds,
			)
			if err != nil {
				return err
			}
			switch testCase.Type {
			case models.Text:
				var textTestCase models.TextTestcaseBody = testCase.TestcaseBody.(models.TextTestcaseBody)
				_, err = store.db.Exec("INSERT INTO text_testcases (testcase_id, inputs, outputs, hidden) VALUES ($1, $2, $3, $4) ON CONFLICT (testcase_id) DO UPDATE SET testcase_id=$1, inputs = $2, outputs = $3, hidden = $4;",
					textTestCase.TestcaseId, textTestCase.Inputs, textTestCase.Outputs, textTestCase.Hidden,
				)
				if err != nil {
					return err
				}
			default:
				var bashTestCase models.BashTestcaseBody = testCase.TestcaseBody.(models.BashTestcaseBody)
				var primaryBash models.File = bashTestCase.PrimaryBashFile
				_, err = store.db.Exec("INSERT INTO bash_testcase_files (id, testcase_id, name, suffix, body, primary_bash) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET id = $1, testcase_id = $2, name = $3, suffix = $4, body = $5, primary_bash = $6",
					primaryBash.Id, primaryBash.TestcaseId, primaryBash.Name, primaryBash.Suffix, primaryBash.Body, true,
				)
				if err != nil {
					return err
				}
				for _, file := range bashTestCase.OtherFiles {
					_, err = store.db.Exec("INSERT INTO bash_testcase_files (id, testcase_id, name, suffix, body, primary_bash) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET id = $1, testcase_id = $2, name = $3, suffix = $4, body = $5, primary_bash = $6",
						file.Id, file.TestcaseId, file.Name, file.Suffix, file.Body, false,
					)
					if err != nil {
						return err
					}
				}
			}
		}
	}
	return nil
}

func (store PostgresStore) DeleteAssignment(assignmentId uuid.UUID) error {
	_, err := store.db.Exec(
		"DELETE FROM assignments WHERE id=$1",
		assignmentId,
	)
	if err != nil {
		return err
	}
	return nil
}

func (store PostgresStore) DeleteQuestion(questionId uuid.UUID) error {
	_, err := store.db.Exec(
		"DELETE FROM questions WHERE id=$1",
		questionId,
	)
	if err != nil {
		return err
	}
	return nil
}

func (store PostgresStore) DeleteTestcase(testcaseId uuid.UUID) error {
	_, err := store.db.Exec(
		"DELETE FROM testcases WHERE id=$1",
		testcaseId,
	)
	if err != nil {
		return err
	}
	return nil
}

func (store PostgresStore) SetVerboseQuestion(question models.Question) error {
	_, err := store.db.Exec(
		"INSERT INTO questions (id, assignment_id, header, body, prog_lang, updated_at, sort_index, default_code, solution_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET header = $3, body=$4, prog_lang=$5, updated_at=$6, sort_index=$7, default_code = $8, solution_code = $9;",
		question.Id, question.AssignmentId, question.Header, question.Body, question.ProgrammingLanguage, time.Now(), question.SortIndex, question.DefaultCode, question.SolutionCode,
	)
	if err != nil {
		return err
	}
	for _, testCase := range question.Testcases {
		_, err = store.db.Exec("INSERT INTO testcases (id, question_id, name, type, points, timeout_seconds) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET name=$3, points=$5, timeout_seconds=$6;",
			testCase.Id, testCase.QuestionId, testCase.Name, testCase.Type, testCase.Points, testCase.TimeoutSeconds,
		)
		if err != nil {
			return err
		}
		switch testCase.Type {
		case models.Text:
			var textTestCase models.TextTestcaseBody = testCase.TestcaseBody.(models.TextTestcaseBody)
			_, err = store.db.Exec("INSERT INTO text_testcases (testcase_id, inputs, outputs, hidden) VALUES ($1, $2, $3, $4) ON CONFLICT (testcase_id) DO UPDATE SET testcase_id=$1, inputs = $2, outputs = $3, hidden = $4;",
				textTestCase.TestcaseId, textTestCase.Inputs, textTestCase.Outputs, textTestCase.Hidden,
			)
			if err != nil {
				return err
			}
		default:
			var bashTestCase models.BashTestcaseBody = testCase.TestcaseBody.(models.BashTestcaseBody)
			var primaryBash models.File = bashTestCase.PrimaryBashFile
			_, err = store.db.Exec("INSERT INTO bash_testcase_files (id, testcase_id, name, suffix, body, primary_bash) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET id = $1, testcase_id = $2, name = $3, suffix = $4, body = $5, primary_bash = $6",
				primaryBash.Id, primaryBash.TestcaseId, primaryBash.Name, primaryBash.Suffix, primaryBash.Body, true,
			)
			if err != nil {
				return err
			}
			for _, file := range bashTestCase.OtherFiles {
				_, err = store.db.Exec("INSERT INTO bash_testcase_files (id, testcase_id, name, suffix, body, primary_bash) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET id = $1, testcase_id = $2, name = $3, suffix = $4, body = $5, primary_bash = $6",
					file.Id, file.TestcaseId, file.Name, file.Suffix, file.Body, false,
				)
				if err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func (store PostgresStore) GetQuestionTestcases(questionId uuid.UUID) ([]models.Testcase, error) {
	var testcases []models.Testcase
	err := store.db.Select(
		&testcases,
		"SELECT id, name, question_id, type, points, timeout_seconds FROM testcases WHERE question_id = $1;",
		questionId,
	)
	if err != nil {
		return []models.Testcase{}, err
	}
	for testcaseIndex := range testcases {
		testcase := &testcases[testcaseIndex]
		switch testcase.Type {
		case models.Text:
			textBody := models.TextTestcaseBody{}
			_ = store.db.Get(
				&textBody,
				"SELECT testcase_id, inputs, outputs, hidden FROM text_testcases WHERE testcase_id = $1;",
				testcase.Id,
			)
			testcase.TestcaseBody = textBody
		default:
			bashBody := models.BashTestcaseBody{}
			var primaryBashFile models.File
			var otherFiles []models.File
			err = store.db.Select(
				&otherFiles,
				"SELECT id, testcase_id, name, suffix, body, primary_bash FROM bash_testcase_files WHERE testcase_id = $1 AND primary_bash = FALSE;",
				testcase.Id,
			)
			if err != nil {
				return []models.Testcase{}, err
			}
			err = store.db.Get(
				&primaryBashFile,
				"SELECT id, testcase_id, name, suffix, body, primary_bash FROM bash_testcase_files WHERE testcase_id = $1 AND primary_bash = TRUE;",
				testcase.Id,
			)
			if err != nil {
				return []models.Testcase{}, err
			}
			bashBody.PrimaryBashFile = primaryBashFile
			bashBody.OtherFiles = otherFiles
			testcase.TestcaseBody = bashBody
		}
	}
	return testcases, nil
}

func (store PostgresStore) GetAssignmentInfo(assignmentId uuid.UUID) (models.Assignment, error) {
	var assignment models.Assignment
	err := store.db.Get(
		&assignment,
		"SELECT id, classroom_id, name, description, assignment_mode, due_at, created_at, updated_at, sort_index FROM assignments WHERE id=$1;",
		assignmentId,
	)
	if err != nil {
		return models.Assignment{}, err
	}
	return assignment, nil
}

func (store PostgresStore) GetAssignment(assignmentId uuid.UUID, userId uuid.UUID) (models.Assignment, error) {
	var assignment models.Assignment
	err := store.db.QueryRowx(
		"SELECT id, classroom_id, name, description, assignment_mode, due_at, created_at, updated_at, sort_index FROM assignments WHERE id = $1;",
		assignmentId,
	).StructScan(&assignment)
	if err != nil {
		return models.Assignment{}, err
	}

	var questions []models.Question

	err = store.db.Select(
		&questions,
		"SELECT id, assignment_id, header, body, sort_index, prog_lang, default_code FROM questions WHERE assignment_id = $1;",
		assignment.Id,
	)
	if err != nil {
		return models.Assignment{}, err
	}

	sort.Slice(questions, func(i int, j int) bool {
		return questions[i].SortIndex < questions[j].SortIndex
	})

	for i := range questions {
		questionId := questions[i].Id
		score, err := store.GetStudentQuestionGrade(userId, questionId)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return models.Assignment{}, err
		}
		points, err := store.GetQuestionPoints(questionId)
		if err != nil {
			return models.Assignment{}, err
		}
		questions[i].Points = points
		questions[i].Score = score
		var submissionInfo struct {
			Id       uuid.UUID `db:"id"`
			Code     string    `db:"code"`
			Status   string    `db:"status"`
			Feedback string    `db:"feedback"`
		}
		if subErr := store.db.Get(&submissionInfo,
			"SELECT id, code, status, feedback FROM student_submissions WHERE user_id=$1 AND question_id=$2",
			userId, questionId,
		); subErr == nil {
			questions[i].CodeSubmission = submissionInfo.Code
			questions[i].SubmissionId = &submissionInfo.Id
			questions[i].SubmissionStatus = submissionInfo.Status
			questions[i].ConsoleOutput = submissionInfo.Feedback
		}
	}

	assignment.Questions = questions

	return assignment, nil
}

func (store PostgresStore) EditClassroom(request models.EditClassroomRequest) error {

	var classroom models.Classroom

	err := store.db.QueryRowx("UPDATE classrooms SET name = $1, start_date = $2, end_date = $3, course_code = $4, course_description =$5, banner_image_index = $6, updated_at = $7 WHERE id = $8 RETURNING id, name, created_at, updated_at, start_date, end_date, course_code, course_description, banner_image_index;",
		request.Name, request.StartDate, request.EndDate, request.CourseCode, request.CourseDescription, request.BannerImageIndex, time.Now(), request.RoomId,
	).StructScan(&classroom)

	if err != nil {
		return err
	}
	return nil
}

func (store PostgresStore) DeleteClassroom(request models.DeleteClassroomRequest) error {
	_, err := store.db.Exec("DELETE FROM classrooms WHERE id = $1", request.RoomId)

	if err != nil {
		return err
	}

	_, err = store.db.Exec("DELETE FROM user_classroom_matching WHERE classroom_id = $1", request.RoomId)
	if err != nil {
		return err
	}
	return nil
}

func (store PostgresStore) UpdateSubmissionCode(request models.UpdateSubmissionRequest) error {
	var exists bool
	err := store.db.Get(
		&exists,
		"SELECT EXISTS (SELECT * FROM student_submissions WHERE user_id=$1 AND question_id=$2)",
		request.UserId, request.QuestionId,
	)
	if err != nil {
		return err
	}

	if exists {
		_, err = store.db.Exec("UPDATE student_submissions SET code=$1, updated_at=$2 WHERE user_id=$3 AND question_id=$4",
			request.Code, request.UpdatedAt, request.UserId, request.QuestionId,
		)
		if err != nil {
			return err
		}
	} else {
		_, err = store.db.Exec("INSERT INTO student_submissions (id, user_id, question_id, code, updated_at) VALUES ($1, $2, $3, $4, $5)",
			request.Id, request.UserId, request.QuestionId, request.Code, request.UpdatedAt,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

func (store PostgresStore) UpdateClassroomGrades(updates []models.GradeUpdate) error {
	for _, update := range updates {
		_, err := store.db.Exec(
			`INSERT INTO question_grade_overrides (question_id, student_id, is_manual_grade, new_grade)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (student_id, question_id) DO UPDATE SET is_manual_grade = $3, new_grade = $4`,
			update.QuestionId, update.StudentId, update.IsManualGrade, update.NewScore,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

func (store PostgresStore) CreateDefaultSubmission(userId uuid.UUID, questionId uuid.UUID, defaultCode string) (uuid.UUID, error) {
	submissionId := uuid.New()
	_, err := store.db.Exec(
		"INSERT INTO student_submissions (id, user_id, question_id, code, updated_at) VALUES ($1, $2, $3, $4, NOW())",
		submissionId, userId, questionId, defaultCode,
	)
	if err != nil {
		return uuid.UUID{}, err
	}
	return submissionId, nil
}

func (store PostgresStore) GetClassroomGrades(classroomId uuid.UUID) (models.ClassroomGradesResult, error) {
	var assignments []struct {
		Id   uuid.UUID `db:"id"`
		Name string    `db:"name"`
	}
	err := store.db.Select(&assignments,
		"SELECT id, name FROM assignments WHERE classroom_id = $1",
		classroomId,
	)
	if err != nil {
		return models.ClassroomGradesResult{}, err
	}

	var students []struct {
		UserId    uuid.UUID `db:"user_id"`
		FirstName string    `db:"first_name"`
		LastName  string    `db:"last_name"`
	}
	err = store.db.Select(&students, `
		SELECT u.id AS user_id, u.first_name, u.last_name
		FROM user_classroom_matching ucm
		JOIN users u ON ucm.user_id = u.id
		WHERE ucm.classroom_id = $1 AND ucm.user_role IN ('student', 'assistant')
		ORDER BY
			CASE ucm.user_role
				WHEN 'student' THEN 0
				WHEN 'assistant' THEN 1
				ELSE 2
			END,
			u.last_name, u.first_name
	`, classroomId)
	if err != nil {
		return models.ClassroomGradesResult{}, err
	}

	result := models.ClassroomGradesResult{
		Assignments: make([]models.AssignmentGradeResult, 0),
	}

	for _, assignment := range assignments {
		var questions []struct {
			Id          uuid.UUID `db:"id"`
			Header      string    `db:"header"`
			DefaultCode string    `db:"default_code"`
			ProgLang    string    `db:"prog_lang"`
		}
		err = store.db.Select(&questions,
			"SELECT id, header, default_code, prog_lang FROM questions WHERE assignment_id = $1",
			assignment.Id,
		)
		if err != nil {
			return models.ClassroomGradesResult{}, err
		}

		assignmentResult := models.AssignmentGradeResult{
			AssignmentId:   assignment.Id,
			AssignmentName: assignment.Name,
			Questions:      make([]models.QuestionGradeResult, 0),
		}

		for _, question := range questions {
			maxPoints, err := store.GetQuestionPoints(question.Id)
			if err != nil {
				return models.ClassroomGradesResult{}, err
			}

			questionResult := models.QuestionGradeResult{
				QuestionId:   question.Id,
				QuestionName: question.Header,
				MaxPoints:    int(maxPoints),
				ProgLang:     question.ProgLang,
				Submissions:  make([]models.QuestionSubmissionGrade, 0),
			}

			for _, student := range students {
				var submissionId uuid.UUID
				var consoleOutput string
				var code string
				var status string
				var submission struct {
					Id       uuid.UUID `db:"id"`
					Feedback string    `db:"feedback"`
					Code     string    `db:"code"`
					Status   string    `db:"status"`
				}
				if subErr := store.db.Get(&submission,
					"SELECT id, feedback, code, status FROM student_submissions WHERE user_id=$1 AND question_id=$2",
					student.UserId, question.Id,
				); subErr == nil {
					submissionId = submission.Id
					consoleOutput = submission.Feedback
					code = submission.Code
					status = submission.Status
				} else {
					submissionId, _ = store.CreateDefaultSubmission(student.UserId, question.Id, question.DefaultCode)
					code = question.DefaultCode
					status = models.SubmissionFailed
				}

				score, _ := store.GetStudentQuestionGrade(student.UserId, question.Id)

				var isManualGrade bool
				var manualGrade int
				var override struct {
					IsManualGrade bool `db:"is_manual_grade"`
					NewGrade      int  `db:"new_grade"`
				}
				if overrideErr := store.db.Get(&override,
					"SELECT is_manual_grade, COALESCE(new_grade, 0) AS new_grade FROM question_grade_overrides WHERE student_id=$1 AND question_id=$2",
					student.UserId, question.Id,
				); overrideErr == nil {
					isManualGrade = override.IsManualGrade
					manualGrade = override.NewGrade
				}

				questionResult.Submissions = append(questionResult.Submissions, models.QuestionSubmissionGrade{
					SubmissionId:  submissionId,
					StudentId:     student.UserId,
					StudentName:   student.FirstName + " " + student.LastName,
					Score:         int(score),
					Code:          code,
					ConsoleOutput: consoleOutput,
					IsManualGrade: isManualGrade,
					ManualGrade:   manualGrade,
					Status:        status,
				})
			}

			assignmentResult.Questions = append(assignmentResult.Questions, questionResult)
		}

		result.Assignments = append(result.Assignments, assignmentResult)
	}

	return result, nil
}

func (store PostgresStore) SetSubmissionStatus(submissionId uuid.UUID, status models.SubmissionStatus) error {
	_, err := store.db.Exec(
		"UPDATE student_submissions SET status = $2 WHERE id = $1",
		submissionId, status,
	)
	return err
}

func (store PostgresStore) GetSubmissionStatuses(submissionIds []uuid.UUID, userId uuid.UUID, isPrivileged bool) ([]models.SubmissionStatusResult, error) {
	var rows []struct {
		Id         uuid.UUID `db:"id"`
		Status     string    `db:"status"`
		Feedback   string    `db:"feedback"`
		UserId     uuid.UUID `db:"user_id"`
		QuestionId uuid.UUID `db:"question_id"`
	}
	err := store.db.Select(&rows,
		"SELECT id, status, feedback, user_id, question_id FROM student_submissions WHERE id = ANY($1) AND ($2 OR user_id = $3)",
		pq.Array(submissionIds), isPrivileged, userId,
	)
	if err != nil {
		return nil, err
	}

	results := make([]models.SubmissionStatusResult, 0, len(rows))
	for _, row := range rows {
		score, _ := store.GetStudentQuestionGrade(row.UserId, row.QuestionId)
		results = append(results, models.SubmissionStatusResult{
			SubmissionId:  row.Id,
			Status:        row.Status,
			Score:         int(score),
			ConsoleOutput: row.Feedback,
		})
	}
	return results, nil
}

func (store PostgresStore) UpdateSolutionCode(questionId uuid.UUID, code string) error {
	_, err := store.db.Exec(
		"UPDATE questions SET solution_code = $2, updated_at = NOW() WHERE id = $1",
		questionId, code,
	)
	return err
}

func (store PostgresStore) CreateSolutionTestRun(runId uuid.UUID, questionId uuid.UUID) error {
	// Cleanup: a question only ever has its most recent run, so drop any
	// earlier runs for this question before creating the new one.
	if _, err := store.db.Exec("DELETE FROM solution_test_runs WHERE question_id = $1", questionId); err != nil {
		return err
	}
	_, err := store.db.Exec(
		"INSERT INTO solution_test_runs (id, question_id, status, results) VALUES ($1, $2, 'running', '[]'::JSONB)",
		runId, questionId,
	)
	return err
}

func (store PostgresStore) GetSolutionTestRun(runId uuid.UUID) (models.SolutionTestRun, error) {
	var run models.SolutionTestRun
	err := store.db.Get(
		&run,
		"SELECT id, question_id, status, results FROM solution_test_runs WHERE id = $1",
		runId,
	)
	if err != nil {
		return models.SolutionTestRun{}, err
	}
	return run, nil
}

func (store PostgresStore) SetSolutionTestRunStatus(runId uuid.UUID, status models.SubmissionStatus) error {
	_, err := store.db.Exec(
		"UPDATE solution_test_runs SET status = $2, updated_at = NOW() WHERE id = $1",
		runId, status,
	)
	return err
}

func (store PostgresStore) GetUserRole(user string, classroomId uuid.UUID) (models.UserRole, error) {
	userInfo, err := store.GetUserInfo(user)
	if err != nil {
		return "", err
	}
	var role models.UserRole
	err = store.db.Get(&role, "SELECT user_role FROM user_classroom_matching WHERE user_id=$1 AND classroom_id=$2", userInfo.Id, classroomId)
	return role, err
}
