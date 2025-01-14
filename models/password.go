package models

import (
	"net/mail"
	"time"

	"github.com/google/uuid"
)

type (
	PasswordResetDetails struct {
		Id        uuid.UUID    `json:"id"`
		UserId    string       `json:"user_id"`
		TokenHash string       `json:"token_hash"`
		Email     mail.Address `json:"email"`
		CreatedAt string       `json:"created_at"`
		ExpiresAt time.Time    `json:"expires_at"`
	}

	NewPasswordDetails struct {
		RequestId    string `json:"request_id"`
		RequestToken string `json:"request_token"`
		NewPassword  string `json:"new_password"`
	}
)
