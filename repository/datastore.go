package repository

import (
	"fmt"

	"github.com/UDCS/Autograder/config"
	"github.com/UDCS/Autograder/models"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Datastore interface {
	CreateClassroom(classroom models.Classroom) (models.Classroom, error)
}

type PostgresStore struct {
	db *sqlx.DB
}

func New(dbConfig *config.Db) PostgresStore {
	ConnString := getConnStringFromConfig(dbConfig)
	db := sqlx.MustConnect("postgres", ConnString)

	return PostgresStore{
		db: db,
	}
}

func getConnStringFromConfig(dbConfig *config.Db) string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		dbConfig.User, dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.DBName, dbConfig.SslMode)
}
