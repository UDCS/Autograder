package repository

import (
	"net/mail"

	"github.com/UDCS/Autograder/models"
)

func (store PostgresStore) CreateInvitation(invitation models.Invitation) (*models.Invitation, error) {
	createdInvitation := models.Invitation{}
	err := store.db.QueryRowx(
		`INSERT INTO invitations (id, email, user_role, token_hash, created_at, updated_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7) 
		RETURNING id, email, user_role, created_at, updated_at, expires_at;`,
		invitation.Id, invitation.Email, invitation.UserRole, invitation.TokenHash, invitation.CreatedAt, invitation.UpdatedAt, invitation.ExpiresAt,
	).StructScan(&createdInvitation)

	return &createdInvitation, err
}

func (store PostgresStore) CreateUser(user models.User) (*models.User, error) {
	createdUser := models.User{}
	err := store.db.QueryRowx(
		`INSERT INTO users (id, name, email, password_hash, user_role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) 
		RETURNING id, name, email, user_role, created_at, updated_at;`,
		user.Id, user.Email, user.PasswordHash, user.Role, user.CreatedAt, user.UpdatedAt,
	).StructScan(&createdUser)

	return &createdUser, err
}

func (store PostgresStore) GetUserInfo(email mail.Address) (*models.User, error) {
	var user models.User
	err := store.db.Get(
		&user,
		"SELECT id, name, email, password_hash, user_role, created_at, updated_at FROM users WHERE email = $1;",
		email,
	)

	return &user, err
}

func (store PostgresStore) UpdateUserPassword(userId string, passwordHash string, updatedAt string) (*models.User, error) {
	retrievedUser := models.User{}
	err := store.db.QueryRowx(
		"UPDATE users SET password_hash = $2, updated_at = $3 WHERE id = $1 RETURNING id, name, email, user_role, created_at, updated_at;",
		userId, passwordHash, updatedAt,
	).StructScan(&retrievedUser)
	return &retrievedUser, err
}

func (store PostgresStore) GetInvitation(invitationId string, tokenHash string) (*models.Invitation, error) {
	var invitation models.Invitation
	err := store.db.Get(
		&invitation,
		"SELECT id, email, user_role, token_hash, created_at, updated_at, expires_at FROM invitations WHERE id = $1 AND token_hash = $2;",
		invitationId, tokenHash,
	)

	return &invitation, err
}

func (store PostgresStore) CreatePasswordChangeRequest(resetDetails models.PasswordResetDetails) error {
	_, err := store.db.Exec(
		"INSERT INTO password_change_requests (id, user_id, token_hash, created_at, expires_at) VALUES ($1, $2, $3, $4, $5);",
		resetDetails.Id, resetDetails.UserId, resetDetails.TokenHash, resetDetails.CreatedAt, resetDetails.ExpiresAt,
	)
	return err
}

func (store PostgresStore) GetPasswordChangeRequest(requestId string, tokenHash string) (*models.PasswordResetDetails, error) {
	createdRequest := models.PasswordResetDetails{}
	err := store.db.QueryRowx(
		"SELECT id, user_id, token_hash, created_at, expires_at FROM password_change_requests WHERE id = $1 AND token_hash = $2;",
		requestId, tokenHash,
	).StructScan(&createdRequest)

	return &createdRequest, err
}

func (store PostgresStore) DeletePasswordChangeRequest(requestId string) error {
	_, err := store.db.Exec(
		"DELETE FROM password_change_requests WHERE id = $1;",
		requestId,
	)

	return err
}
