package repository

import (
	"fmt"
	"net/mail"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Datastore interface {
	// Classroom
	CreateClassroom(classroom models.Classroom) (*models.Classroom, error)
	// Auth
	CreateInvitation(invitation models.Invitation) (*models.Invitation, error)
	CreateUser(user models.User) (*models.User, error)
	GetUserInfo(email mail.Address) (*models.User, error)
	UpdateUserPassword(userId string, passwordHash string, updatedAt string) (*models.User, error)
	GetInvitation(invitationId string, tokenHash string) (*models.Invitation, error)
	CreatePasswordChangeRequest(resetDetails models.PasswordResetDetails) error
	GetPasswordChangeRequest(requestId string, tokenHash string) (*models.PasswordResetDetails, error)
	DeletePasswordChangeRequest(requestId string) error
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
