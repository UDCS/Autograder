package service

import (
	"errors"
	"fmt"
	"time"

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
	createdClassroom, err := app.store.CreateClassroom(classroom)
	e := app.store.MatchUserToClassroom(userInfo.Email, string(userInfo.UserRole), createdClassroom.Id)
	if e != nil {
		return createdClassroom, e
	}
	return createdClassroom, err
}

func (app *GraderApp) MatchUserToClassroom(jwksToken string, userEmail string, userRole string, classroomId uuid.UUID) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)

	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return fmt.Errorf("unauthorized: only an admin or an instructor can add students to a classroom")
	}

	_, err = app.store.GetUserInfo(userEmail)
	if err == nil {
		_, err = app.store.GetClassroomInfo(classroomId)
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

	user, err := app.store.GetUserClassroomInfo(userInfo.Id, request.RoomId)

	if err != nil && claims.Role != models.Admin {
		return fmt.Errorf("invalid change request")
	}

	if user.UserRole != models.Instructor && claims.Role != models.Admin {
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

	user, err := app.store.GetUserClassroomInfo(userInfo.Id, request.RoomId)

	if err != nil && claims.Role != models.Admin {
		return fmt.Errorf("invalid change request")
	}

	if user.UserRole != models.Instructor && claims.Role != models.Admin {
		return fmt.Errorf("unauthorized: only an admin or an instructor can delete a classroom")
	}

	err = app.store.DeleteClassroom(request)

	if err != nil {
		return err
	}

	return nil
}

func (app *GraderApp) GetViewAssignments(jwksToken string, classroomId uuid.UUID) ([]models.Assignment, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return []models.Assignment{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return []models.Assignment{}, fmt.Errorf("error retrieving user info")
	}

	if userInfo.UserRole != models.Admin {
		_, err = app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return []models.Assignment{}, fmt.Errorf("user not in classroom")
		}
	}

	assignments, err := app.store.GetViewAssignments(userInfo.Id, classroomId)
	if err != nil {
		return []models.Assignment{}, err
	}
	return assignments, nil
}

func (app *GraderApp) GetVerboseAssignments(jwksToken string, classroomId uuid.UUID) ([]models.Assignment, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return []models.Assignment{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return []models.Assignment{}, fmt.Errorf("error retrieving user info")
	}

	if userInfo.UserRole != models.Admin {
		user, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return []models.Assignment{}, fmt.Errorf("user not in classroom")
		} else if user.UserRole != models.Instructor && user.UserRole != models.Assistant {
			return []models.Assignment{}, fmt.Errorf("user does not have the role to view verbose assignment")
		}
	}

	assignments, err := app.store.GetVerboseAssignments(userInfo.Id, classroomId)
	if err != nil {
		return []models.Assignment{}, err
	}
	return assignments, nil
}
func (app *GraderApp) SetVerboseAssignments(jwksToken string, classroomId uuid.UUID, assignments []models.Assignment) error {
	return nil
}

func (app *GraderApp) GetAssignment(jwksToken string, assignmentId uuid.UUID) (models.Assignment, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return models.Assignment{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return models.Assignment{}, fmt.Errorf("error retrieving user info")
	}

	assignment, err := app.store.GetAssignment(assignmentId, userInfo.Id)
	if err != nil {
		return models.Assignment{}, err
	}

	classroomId := assignment.ClassroomId

	if userInfo.UserRole != models.Admin {
		userClassroomInfo, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return models.Assignment{}, fmt.Errorf("user not in classroom")
		}
		if assignment.AssignmentMode != models.View && userClassroomInfo.UserRole == models.Student {
			return models.Assignment{}, fmt.Errorf("user does not have permission to view assignment")
		}
	}

	return assignment, nil
}

func (app *GraderApp) GetClassroom(jwksToken string, classroomId uuid.UUID) (models.Classroom, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)

	if err != nil {
		return models.Classroom{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return models.Classroom{}, fmt.Errorf("invalid authorization credentials")
	}

	if userInfo.UserRole != models.Admin {
		_, err = app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return models.Classroom{}, fmt.Errorf("user not in classroom")
		}
	}

	classroom, err := app.store.GetClassroomInfo(classroomId)
	if err != nil {
		return models.Classroom{}, err
	}

	return classroom, nil
}

func (app *GraderApp) UpdateSubmissionCode(jwksToken string, request models.UpdateSubmissionRequest) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)

	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	request.UserId = userInfo.Id
	request.Id = uuid.New()
	request.UpdatedAt = time.Now()

	err = app.store.UpdateSubmissionCode(request)
	if err != nil {
		return err
	}

	return nil
}

func (app *GraderApp) GetUserRole(jwksToken string, roomId uuid.UUID) (models.UserRole, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return "", fmt.Errorf("invalid authorization credentials")
	}
	return app.store.GetUserRole(claims.Subject, roomId)
}
