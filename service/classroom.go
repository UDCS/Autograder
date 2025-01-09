package service

import (
	"fmt"

	"github.com/UDCS/Autograder/models"
)

func (app *GraderApp) CreateClassroom(claims *models.Claims, classroom models.Classroom) (*models.Classroom, error) {
	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return nil, fmt.Errorf("unauthorized: only an admin or an instructor can create a classroom")
	}

	return app.store.CreateClassroom(classroom)
}
