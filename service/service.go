package service

import (
	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/repository"
)

type App interface {
	// Auth
	CreateInvitation(invitation models.Invitation) (models.InvitationWithToken, error)
	SignUp(user models.UserWithInvitation) error
	Login(user models.UserWithPassword) error
	Logout(user models.User) error
	// Classroom
	CreateClassroom(classroom models.Classroom) (models.Classroom, error)
}

type GraderApp struct {
	store repository.Datastore
}

func New(store repository.Datastore) *GraderApp {
	return &GraderApp{
		store: store,
	}
}
