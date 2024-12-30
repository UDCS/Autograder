package repository

import (
	"log"
	"os"

	"github.com/UDCS/Autograder/entities"
	"github.com/jmoiron/sqlx"
)

type Datastore interface {
	CreateClassroom(classroom entities.Classroom) (entities.Classroom, error)
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

	err := db.Ping()
	if err != nil {
		log.Fatalf("could not connect to the database: %v", err)
	}

	return PostgresStore{
		db: db,
	}
}
