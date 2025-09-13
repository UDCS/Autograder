package service

import (
	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/repository"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/google/uuid"
)

type App interface {
	// Auth
	CreateInvitation(jwksToken string, invitation models.Invitation) (*models.Invitation, error)
	InviteAdmin(invitation models.Invitation) (*models.Invitation, error)
	SignUp(user models.UserWithInvitation, session models.Session) (*models.JWTTokens, error)
	Login(user models.UserWithPassword, session models.Session) (*models.JWTTokens, error)
	Logout(sessionId uuid.UUID) error
	PasswordResetRequest(jwksToken string) error
	PasswordReset(details models.NewPasswordDetails, session models.Session) (*models.JWTTokens, error)
	RefreshToken(tokenString string) (*models.AccessToken, error)
	IsValidLogin(jwksToken string) bool
	GetUserName(jwksToken string) (*models.UserName, error)
	// Classroom
	CreateClassroom(jwksToken string, classroom models.Classroom) (*models.Classroom, error)
	MatchUserToClassroom(jwksToken string, userId string, role string, classroomId uuid.UUID) error
	EditClassroom(jwksToken string, request models.EditClassroomRequest) error
	DeleteClassroom(jwksToken string, request models.DeleteClassroomRequest) error
	GetClassroomsOfUser(jwksToken string) ([]models.Classroom, error)
	GetClassroom(jwksToken string, classroomId uuid.UUID) (models.Classroom, error)
	ChangeUserInfo(jwksToken string, request models.ChangeUserInfoRequest) error
	GetUserRole(jwksToken string, roomId uuid.UUID) (models.UserRole, error)
	// Assignments
	GetViewAssignments(jwksToken string, classroomId uuid.UUID) ([]models.Assignment, error)
	GetVerboseAssignments(jwksToken string, classroomId uuid.UUID) ([]models.Assignment, error)
	SetVerboseAssignments(jwksToken string, assignments []models.Assignment) error
	SetVerboseQuestions(jwksToken string, questions []models.Question) error
	GetAssignment(jwksToken string, assignmentId uuid.UUID) (models.Assignment, error)
	UpdateSubmissionCode(jwksToken string, request models.UpdateSubmissionRequest) error
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
