package repository

import (
	"fmt"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Datastore interface {
	// Classroom
	CreateClassroom(classroom models.Classroom) (*models.Classroom, error)
	MatchUserToClassroom(email string, role string, classroomId uuid.UUID) error
	GetUserClassroomInfo(userId uuid.UUID, classroomId uuid.UUID) (models.UserInClassroom, error)
	EditClassroom(request models.EditClassroomRequest) error
	DeleteClassroom(request models.DeleteClassroomRequest) error
	GetClassroomInfo(classroomId uuid.UUID) (models.Classroom, error)
	GetUserRole(user string, classroomId uuid.UUID) (models.UserRole, error)
	// Assignments
	GetViewAssignments(userId uuid.UUID, classroomId uuid.UUID) ([]models.Assignment, error)
	GetVerboseAssignments(userId uuid.UUID, classroomId uuid.UUID) ([]models.Assignment, error)
	SetVerboseAssignment(assignment models.Assignment) error
	SetVerboseQuestion(question models.Question) error
	GetAssignment(assignmentId uuid.UUID, userId uuid.UUID) (models.Assignment, error)
	GetAssignmentInfo(assignmentId uuid.UUID) (models.Assignment, error)
	GetQuestionInfo(questionId uuid.UUID) (models.Question, error)
	UpdateSubmissionCode(request models.UpdateSubmissionRequest) error
	// Auth
	// Invitation
	CreateInvitation(invitation models.Invitation) (*models.Invitation, error)
	CompleteInvitation(invitationId uuid.UUID, completed bool, updatedAt time.Time) error
	GetInvitation(invitationId uuid.UUID, tokenHash string) (*models.Invitation, error)
	// User
	CreateUser(user models.User) (*models.User, error)
	GetUserInfo(email string) (*models.User, error)
	// Password
	UpdateUserPassword(userId uuid.UUID, passwordHash string, updatedAt time.Time) (*models.User, error)
	CreatePasswordChangeRequest(resetDetails models.PasswordResetDetails) error
	GetPasswordChangeRequest(requestId uuid.UUID, tokenHash string) (*models.PasswordResetDetails, error)
	CompletePasswordChangeRequest(requestId uuid.UUID, completed bool, updatedAt time.Time) error
	// Session
	CreateSession(session models.Session) (*models.Session, error)
	DeleteSession(sessionId uuid.UUID) error
	GetSession(userEmail string, refreshTokenString string) (*models.Session, error)
	GetClassroomsOfUser(userEmail string) ([]models.Classroom, error)
	ChangeUserInfo(request models.ChangeUserInfoRequest) error
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
