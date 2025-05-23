package service

import (
	"errors"
	"fmt"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/jwt_token"
	"github.com/google/uuid"
)

func (app *GraderApp) CreateClassroom(jwksToken string, classroom models.Classroom) (*models.Classroom, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return nil, fmt.Errorf("invalid autorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)

	if err != nil {
		return nil, fmt.Errorf("user does not exist")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return nil, fmt.Errorf("unauthorized: only an admin or an instructor can create a classroom")
	}
	fmt.Println("Creating classroom from service")
	createdClassroom, err := app.store.CreateClassroom(classroom)
	e := app.store.MatchUserToClassroom(userInfo.Email, string(userInfo.UserRole), createdClassroom.Id.String())
	if e != nil {
		return createdClassroom, e
	}
	return createdClassroom, err
}

func (app *GraderApp) MatchUserToClassroom(jwksToken string, userEmail string, userRole string, classroomId string) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)

	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return fmt.Errorf("unauthorized: only an admin or an instructor can add students to a classroom")
	}

	_, err = app.store.GetUserInfo(userEmail)
	if err == nil {
		classUuid, err := uuid.Parse(classroomId)
		if err != nil {
			return err
		}
		_, err = app.store.GetClassroomInfo(classUuid)
		if err != nil {
			return err
		}
		err = app.store.MatchUserToClassroom(userEmail, userRole, classroomId)
		if err != nil {
			return err
		}
	} else {
		return errors.New("user does not exist")
	}

	return nil
}
func (app *GraderApp) EditClassroom(jwksToken string, request models.EditClassroomRequest) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)

	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return fmt.Errorf("unauthorized: only an admin or an instructor can edit a classroom")
	}

	user, err := app.store.GetUserClassroomInfo(userInfo.Id.String(), request.RoomId)

	if err != nil && claims.Role != models.Admin {
		return fmt.Errorf("invalid change request")
	}

	if user.User_role != models.Instructor && claims.Role != models.Admin {
		return fmt.Errorf("unauthorized: only an admin or an instructor can edit a classroom")
	}

	err = app.store.EditClassroom(request)

	if err != nil {
		return err
	}

	return nil
}

func (app *GraderApp) DeleteClassroom(jwksToken string, request models.DeleteClassroomRequest) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return fmt.Errorf("unauthorized: only an admin or an instructor can delete a classroom")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)

	if err != nil {
		return fmt.Errorf("error - user does not exist")
	}

	user, err := app.store.GetUserClassroomInfo(userInfo.Id.String(), request.RoomId)

	if err != nil && claims.Role != models.Admin {
		return fmt.Errorf("invalid change request")
	}

	if user.User_role != models.Instructor && claims.Role != models.Admin {
		return fmt.Errorf("unauthorized: only an admin or an instructor can delete a classroom")
	}

	err = app.store.DeleteClassroom(request)

	if err != nil {
		return err
	}

	return nil
}
