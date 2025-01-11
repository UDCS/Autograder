package models

import (
	"net/mail"

	"github.com/google/uuid"
)

type (
	Invitation struct {
		Id        uuid.UUID    `json:"id"`
		Email     mail.Address `json:"email"`
		UserRole  UserRole     `json:"user_role"`
		TokenHash string       `json:"token_hash"`
		CreatedAt string       `json:"created_at"`
		UpdatedAt string       `json:"updated_at"`
		ExpiresAt string       `json:"expires_at"`
	}
)
