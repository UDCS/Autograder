package models

import (
	"time"

	"github.com/google/uuid"
)

type (
	Invitation struct {
		Id          uuid.UUID `json:"id" db:"id"`
		Email       string    `json:"email" db:"email"`
		UserRole    UserRole  `json:"role" db:"user_role"`
		TokenHash   string    `json:"token_hash" db:"token_hash"`
		Completed   bool      `json:"completed" db:"completed"`
		CreatedAt   time.Time `json:"created_at" db:"created_at"`
		UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
		ExpiresAt   time.Time `json:"expires_at" db:"expires_at"`
		ClassroomId uuid.UUID `json:"classroom_id" db:"classroom_id"`
	}
)
