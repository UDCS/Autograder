package service

import (
	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/repository"
)

type App interface {
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
