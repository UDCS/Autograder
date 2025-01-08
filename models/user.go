package models

import (
	"net/mail"

	"github.com/google/uuid"
)

type (
	User struct {
		ID           uuid.UUID    `json:"id"`
		FirstName    string       `json:"first_name"`
		LastName     string       `json:"last_name"`
		Email        mail.Address `json:"email"`
		PasswordHash string       `json:"password_hash"`
		Role         string       `json:"role"`
		CreatedAt    string       `json:"created_at"`
		UpdatedAt    string       `json:"updated_at"`
	}

	UserWithPassword struct {
		User     User   `json:"user"`
		Password string `json:"password"`
	}
)
