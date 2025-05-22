package service

import (
	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/repository"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/google/uuid"
)

type App interface {
	// Auth
	CreateInvitation(jwksToken string, invitation models.Invitation) (*models.Invitation, error)
	InviteAdmin(invitation models.Invitation) (*models.Invitation, error)
	SignUp(user models.UserWithInvitation, session models.Session) (*models.JWTTokens, error)
	Login(user models.UserWithPassword, session models.Session) (*models.JWTTokens, error)
	Logout(sessionId uuid.UUID) error
	PasswordResetRequest(resetRequest models.PasswordResetDetails) error
	PasswordReset(details models.NewPasswordDetails, session models.Session) (*models.JWTTokens, error)
	RefreshToken(tokenString string) (*models.AccessToken, error)
	IsValidLogin(jwksToken string) bool
	// Classroom
	CreateClassroom(jwksToken string, classroom models.Classroom) (*models.Classroom, error)
	MatchUserToClassroom(jwksToken string, userId string, role string, classroomId string) error
	EditClassroom(jwksToken string, request models.EditClassroomRequest) error
	DeleteClassroom(jwksToken string, request models.DeleteClassroomRequest) error
	GetClassroomsOfUser(jwksToken string) ([]models.Classroom, error)
	ChangeUserData(jwksToken string, request models.ChangeUserDataRequest) error
}

type GraderApp struct {
	store      repository.Datastore
	authConfig *config.Auth
}

func New(store repository.Datastore, authConfig *config.Auth) *GraderApp {
	return &GraderApp{
		store,
		authConfig,
	}
}
