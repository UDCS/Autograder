package service

import (
	"github.com/UDCS/Autograder/entities"
)

func (app *GraderApp) CreateClassroom(classroom entities.Classroom) (entities.Classroom, error) {
	// TODO: check if the user is an admin or an instructor using authorization

	return app.store.CreateClassroom(classroom)
}
