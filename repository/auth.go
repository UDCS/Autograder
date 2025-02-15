package repository

import (
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/google/uuid"
)

func (store PostgresStore) CreateInvitation(invitation models.Invitation) (*models.Invitation, error) {
	var createdInvitation models.Invitation
	err := store.db.QueryRowx(
		`INSERT INTO invitations (id, email, user_role, token_hash, created_at, updated_at, expires_at, classroom_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
		RETURNING id, email, user_role, created_at, updated_at, expires_at, classroom_id;`,
		invitation.Id, invitation.Email, invitation.UserRole, invitation.TokenHash, invitation.CreatedAt, invitation.UpdatedAt, invitation.ExpiresAt, invitation.ClassroomId,
	).StructScan(&createdInvitation)
	return &createdInvitation, err
}

func (store PostgresStore) CreateUser(user models.User) (*models.User, error) {
	var createdUser models.User
	err := store.db.QueryRowx(
		`INSERT INTO users (id, first_name, last_name, email, password_hash, user_role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
		RETURNING id, first_name, last_name, email, user_role, created_at, updated_at;`,
		user.Id, user.FirstName, user.LastName, user.Email, user.PasswordHash, user.UserRole, user.CreatedAt, user.UpdatedAt,
	).StructScan(&createdUser)

	return &createdUser, err
}

func (store PostgresStore) GetUserInfo(email string) (*models.User, error) {
	var user models.User
	err := store.db.Get(
		&user,
		"SELECT id, first_name, last_name, email, password_hash, user_role, created_at, updated_at FROM users WHERE email = $1;",
		email,
	)

	return &user, err
}

func (store PostgresStore) UpdateUserPassword(userId uuid.UUID, passwordHash string, updatedAt time.Time) (*models.User, error) {
	var retrievedUser models.User
	err := store.db.QueryRowx(
		"UPDATE users SET password_hash = $2, updated_at = $3 WHERE id = $1 RETURNING id, first_name, last_name, email, user_role, created_at, updated_at;",
		userId, passwordHash, updatedAt,
	).StructScan(&retrievedUser)
	return &retrievedUser, err
}

func (store PostgresStore) GetInvitation(invitationId uuid.UUID, tokenHash string) (*models.Invitation, error) {
	var invitation models.Invitation
	err := store.db.Get(
		&invitation,
		"SELECT id, email, user_role, token_hash, completed, created_at, updated_at, expires_at, classroom_id FROM invitations WHERE id = $1 AND token_hash = $2;",
		invitationId, tokenHash,
	)

	return &invitation, err
}

func (store PostgresStore) CreatePasswordChangeRequest(resetDetails models.PasswordResetDetails) error {
	_, err := store.db.Exec(
		"INSERT INTO password_change_requests (id, user_id, token_hash, created_at, updated_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6);",
		resetDetails.Id, resetDetails.UserId, resetDetails.TokenHash, resetDetails.CreatedAt, resetDetails.UpdatedAt, resetDetails.ExpiresAt,
	)
	return err
}

func (store PostgresStore) GetPasswordChangeRequest(requestId uuid.UUID, tokenHash string) (*models.PasswordResetDetails, error) {
	createdRequest := models.PasswordResetDetails{}
	err := store.db.QueryRowx(
		"SELECT id, user_id, token_hash, completed, created_at, updated_at, expires_at FROM password_change_requests WHERE id = $1 AND token_hash = $2;",
		requestId, tokenHash,
	).StructScan(&createdRequest)

	return &createdRequest, err
}

func (store PostgresStore) CompleteInvitation(invitationId uuid.UUID, completed bool, updatedAt time.Time) error {
	_, err := store.db.Exec(
		"UPDATE invitations SET completed = $2, updated_at = $3 WHERE id = $1;",
		invitationId, completed, updatedAt,
	)
	return err
}

func (store PostgresStore) CompletePasswordChangeRequest(requestId uuid.UUID, completed bool, updatedAt time.Time) error {
	_, err := store.db.Exec(
		"UPDATE password_change_requests SET completed = $2, updated_at = $3 WHERE id = $1;",
		requestId, completed, updatedAt,
	)
	return err
}

func (store PostgresStore) CreateSession(session models.Session) (*models.Session, error) {
	var createdSession models.Session
	err := store.db.QueryRowx(
		`INSERT INTO sessions (id, user_id, user_email, user_role, token_hash, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, user_id, user_email, user_role, token_hash, created_at, expires_at;`,
		session.Id, session.UserId, session.UserEmail, session.UserRole, session.TokenHash, session.CreatedAt, session.ExpiresAt,
	).StructScan(&createdSession)
	return &createdSession, err
}

func (store PostgresStore) GetSession(userEmail string, refreshTokenString string) (*models.Session, error) {
	var session models.Session
	err := store.db.Get(
		&session,
		"SELECT id, user_id, user_email, user_role, token_hash, created_at, expires_at FROM sessions WHERE user_email = $1 AND token_hash = $2;",
		userEmail, refreshTokenString,
	)

	return &session, err
}

func (store PostgresStore) DeleteSession(sessionId uuid.UUID) error {
	_, err := store.db.Exec(
		"DELETE FROM sessions WHERE id = $1;",
		sessionId,
	)
	return err
}
