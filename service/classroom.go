package service

import (
	"github.com/UDCS/Autograder/models"
)

func (app *GraderApp) CreateClassroom(classroom models.Classroom) (models.Classroom, error) {
	// TODO: check if the user is an admin or an instructor using authorization

	return app.store.CreateClassroom(classroom)
}
