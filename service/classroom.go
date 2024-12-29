package service

import (
	"context"

	"github.com/UDCS/Autograder/entities"
)

func (app *GraderApp) CreateClassroom(c context.Context, classroom entities.Classroom) error {
	return app.store.CreateClassroom(c, classroom)
}
