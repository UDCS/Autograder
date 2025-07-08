package repository

import (
	"fmt"
	"sort"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/google/uuid"
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
	for i := 0; i < len(assignments); i++ {
		var questions []models.Question
		err = store.db.Select(
			&questions,
			"SELECT id, assignment_id, header, body, points, sort_index FROM questions WHERE assignment_id = $1;",
			assignments[i].Id,
		)
		if err != nil {
			return []models.Assignment{}, err
		}
		for i := range questions {

			questionId := questions[i].Id
			var score uint16
			_ = store.db.Get(
				&score,
				"SELECT score FROM grades WHERE question_id=$1 AND student_id=$2;",
				questionId, userId,
			)
			questions[i].Score = score
		}
		sort.Slice(questions, func(i int, j int) bool {
			return questions[i].SortIndex < questions[j].SortIndex
		})
		assignments[i].Questions = questions
	}

	return assignments, nil
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
		"SELECT id, assignment_id, header, body, points, sort_index FROM questions WHERE assignment_id = $1;",
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
		var score uint16
		_ = store.db.Get(
			&score,
			"SELECT score FROM grades WHERE question_id=$1 AND student_id=$2;",
			questionId, userId,
		)
		questions[i].Score = score
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
