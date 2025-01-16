package models

import (
	"time"

	"github.com/google/uuid"
)

type (
	PasswordResetDetails struct {
		Id        uuid.UUID `json:"id" db:"id"`
		UserId    uuid.UUID `json:"user_id" db:"user_id"`
		TokenHash string    `json:"token_hash" db:"token_hash"`
		Email     string    `json:"email" db:"email"`
		Completed bool      `json:"completed" db:"completed"`
		CreatedAt time.Time `json:"created_at" db:"created_at"`
		UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
		ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	}

	NewPasswordDetails struct {
		RequestId    uuid.UUID `json:"request_id" db:"request_id"`
		RequestToken string    `json:"request_token" db:"request_token"`
		NewPassword  string    `json:"new_password" db:"new_password"`
	}
)
