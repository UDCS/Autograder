package datastore

import (
	"context"
	"log"
	"os"

	"github.com/UDCS/Autograder/entities"
	"github.com/jmoiron/sqlx"
)

type Store interface {
	CreateClassroom(ctx context.Context, classroom entities.Classroom) error
}

type PostgresStore struct {
	db *sqlx.DB
}

func New() PostgresStore {
	const Key = "DATABASE_URL" // TODO: Receive this from a config file
	ConnString := os.Getenv(Key)
	if ConnString == "" {
		log.Fatalf("FATAL: Environment variable %s is not set!", Key)
	}

	db := sqlx.MustConnect("postgres", ConnString)

	err := db.QueryRow("SELECT 1")
	if err != nil {
		log.Fatal(err)
	}

	return PostgresStore{
		db: db,
	}
}
