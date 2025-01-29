package models

import (
	"time"

	"github.com/google/uuid"
)

type Classroom struct {
	Id        uuid.UUID `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type AddToClassRequest struct {
	User_email string `json:"email" db:"user_email"`
	User_role  string `json:"role" db:"user_role"`
}
