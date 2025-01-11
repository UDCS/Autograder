package service

import (
	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/repository"
	"github.com/UDCS/Autograder/utils/config"
)

type App interface {
	// Auth
	CreateInvitation(jwksToken string, invitation models.Invitation) (*models.Invitation, error)
	SignUp(user models.UserWithInvitation) (*models.JWTTokenDetails, error)
	Login(user models.UserWithPassword) (*models.JWTTokenDetails, error)
	PasswordResetRequest(resetRequest models.PasswordResetDetails) error
	PasswordReset(details models.NewPasswordDetails) (*models.JWTTokenDetails, error)
	// Classroom
	CreateClassroom(jwksToken string, classroom models.Classroom) (*models.Classroom, error)
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
