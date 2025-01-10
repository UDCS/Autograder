package repository

import (
	"log"
	"net/mail"

	"github.com/UDCS/Autograder/models"
)

func (store PostgresStore) CreateInvitation(invitation models.Invitation) (*models.Invitation, error) {
	createdInvitation := models.Invitation{}
	err := store.db.QueryRowx(
		`INSERT INTO invitations (id, email, user_role, token_hash, created_at, updated_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7) 
		RETURNING id, email, user_role, token_hash, created_at, updated_at, expires_at;`,
		invitation.ID, invitation.Email, invitation.UserRole, invitation.TokenHash, invitation.CreatedAt, invitation.UpdatedAt, invitation.ExpiresAt,
	).StructScan(&createdInvitation)

	if err != nil {
		log.Fatalf("failed to update the database: %v", err)
		return nil, err
	}
	return &createdInvitation, nil
}

func (store PostgresStore) GetUserInfo(email mail.Address) (*models.User, error) {
	var user models.User
	err := store.db.Get(
		&user,
		"SELECT id, name, email, password_hash, user_role, created_at, updared_at FROM users WHERE email = $1;",
		email,
	)

	return &user, err
}
