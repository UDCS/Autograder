package repository

import (
	"fmt"

	"github.com/UDCS/Autograder/models"
)

func (store PostgresStore) CreateClassroom(classroom models.Classroom) (*models.Classroom, error) {
	var createdClassroom models.Classroom
	err := store.db.QueryRowx(
		"INSERT INTO classrooms (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING id, name, created_at, updated_at;",
		classroom.Id, classroom.Name, classroom.CreatedAt, classroom.UpdatedAt,
	).StructScan(&createdClassroom)

	if err != nil {
		return nil, err
	}
	return &createdClassroom, nil
}

func (store PostgresStore) MatchUserToClassroom(email string, role string, classroomId string) error {
	userInfo, err := store.GetUserInfo(email)
	if err != nil {
		return err
	}

	var classroomPair models.UserInClassroom
	err = store.db.Get(&classroomPair,
		"SELECT user_id, classroom_id FROM user_classroom_matching WHERE user_id=$1;",
		userInfo.Id,
	)
	if err == nil {
		return nil
	}
	res, err := store.db.Exec("INSERT INTO user_classroom_matching (user_id, user_role, classroom_id) VALUES ($1, $2, $3)", userInfo.Id, role, classroomId)
	rowsAffected, _ := res.RowsAffected()
	fmt.Println("Rows affected:", rowsAffected)
	if err != nil {
		return err
	}
	return nil
}
