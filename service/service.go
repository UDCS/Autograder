package service

import (
	"context"

	"github.com/UDCS/Autograder/datastore"
	"github.com/UDCS/Autograder/entities"
)

type App interface {
	CreateClassroom(c context.Context, classroom entities.Classroom) error
}

type GraderApp struct {
	store datastore.Store
}

func New(store datastore.Store) *GraderApp {
	return &GraderApp{
		store: store,
	}
}
