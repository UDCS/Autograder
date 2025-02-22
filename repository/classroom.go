package repository

import (
	"fmt"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/google/uuid"
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

func (store PostgresStore) GetClassroomInfo(classroomId uuid.UUID) (models.Classroom, error) {
	var classroom models.Classroom
	err := store.db.QueryRowx(
		"SELECT id, name, created_at, updated_at FROM classrooms WHERE id=$1", classroomId,
	).StructScan(&classroom)
	if err != nil {
		return models.Classroom{}, fmt.Errorf("classroom not found")
	}
	return classroom, nil
}

func (store PostgresStore) MatchUserToClassroom(email string, role string, classroomId string) error {
	userInfo, err := store.GetUserInfo(email)
	if err != nil {
		return err
	}

	var classroomPair models.UserInClassroom
	classroomPair, err = store.GetUserClassroomInfo(userInfo.Id.String(), classroomId)
	if err == nil {
		if classroomPair.User_role != models.UserRole(role) {
			_, err = store.db.Exec(
				"UPDATE user_classroom_matching SET user_role = $3 WHERE user_id = $1 AND classroom_id = $2;",
				classroomPair.User_id, classroomPair.Classroom_id, role,
			)
			if err != nil {
				return err
			}
		}
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

func (store PostgresStore) GetUserClassroomInfo(userId string, classroomId string) (models.UserInClassroom, error) {

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

func (store PostgresStore) EditClassroom(request models.EditClassroomRequest) error {
	_, err := store.db.Exec("UPDATE classrooms SET name = $1, updated_at = $2 WHERE id = $3", request.Name, time.Now(), request.RoomId)

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
