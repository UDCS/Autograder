package models

import (
	"net/mail"

	"github.com/google/uuid"
)

type (
	Invitation struct {
		ID        uuid.UUID    `json:"id"`
		Email     mail.Address `json:"email"`
		UserRole  string       `json:"user_role"`
		TokenHash string       `json:"token_hash"`
		CreatedAt string       `json:"created_at"`
		UpdatedAt string       `json:"updated_at"`
		ExpiresAt string       `json:"expires_at"`
	}

	InvitationWithToken struct {
		Invitation Invitation `json:"invitation"`
		Token      string     `json:"token"`
	}

	UserWithInvitation struct {
		User            User       `json:"user"`
		Password        string     `json:"password"`
		Invitation      Invitation `json:"invitation"`
		InvitationToken string     `json:"invitation_token"`
	}
)
