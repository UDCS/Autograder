package repository

import (
	"log"

	"github.com/UDCS/Autograder/entities"
)

func (store PostgresStore) CreateClassroom(classroom entities.Classroom) (entities.Classroom, error) {
	result := store.db.QueryRow(
		"INSERT INTO classrooms (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING id, name, created_at, updated_at;",
		classroom.ID, classroom.Name, classroom.CreatedAt, classroom.UpdatedAt,
	)

	createdClassroom := entities.Classroom{}
	err := result.Scan(&createdClassroom.ID, &createdClassroom.Name, &createdClassroom.CreatedAt, &createdClassroom.UpdatedAt)
	if err != nil {
		log.Fatalf("failed to successfully update the database: %v", err)
		return entities.Classroom{}, err
	}
	return createdClassroom, nil
}
