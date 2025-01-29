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

type UserInClassroom struct {
	User_id      uuid.UUID `json:"user_id" db:"user_id"`
	User_role    UserRole  `json:"user_role" db:"user_role"`
	Classroom_id uuid.UUID `json:"classroom_id" db:"classroom_id"`
}

type AddToClassRequest struct {
	User_email string `json:"email" db:"user_email"`
	User_role  string `json:"role" db:"user_role"`
}
