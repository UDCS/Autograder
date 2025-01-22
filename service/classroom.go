package service

import (
	"fmt"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/jwt_token"
)

func (app *GraderApp) CreateClassroom(jwksToken string, classroom models.Classroom) (*models.Classroom, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return nil, fmt.Errorf("invalid autorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return nil, fmt.Errorf("unauthorized: only an admin or an instructor can create a classroom")
	}

	return app.store.CreateClassroom(classroom)
}

func (app *GraderApp) MatchUsersToClassroom(userEmails []string, classroomId string) error {
	for _, userEmail := range userEmails {
		_, err := app.store.GetUserInfo(userEmail)
		if err == nil {
			err = app.store.MatchUserToClassroom(userEmail, classroomId)
			if err != nil {
				return err
			}
		} else {
			// send invitation to user
		}
	}
	return nil
}
