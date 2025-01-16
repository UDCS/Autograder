package models

import (
	"time"

	"github.com/google/uuid"
)

type Session struct {
	Id        uuid.UUID `json:"id" db:"id"`
	TokenHash string    `json:"token_hash" db:"token_hash"`
	UserId    uuid.UUID `json:"user_id" db:"user_id"`
	UserEmail string    `json:"user_email" db:"user_email"`
	UserRole  UserRole  `json:"user_role" db:"user_role"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
}
