package service

import (
	"github.com/UDCS/Autograder/entities"
	"github.com/UDCS/Autograder/repository"
)

type App interface {
	CreateClassroom(classroom entities.Classroom) (entities.Classroom, error)
}

type GraderApp struct {
	store repository.Datastore
}

func New(store repository.Datastore) *GraderApp {
	return &GraderApp{
		store: store,
	}
}
