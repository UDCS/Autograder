package models

import (
	"time"

	"github.com/google/uuid"
)

type (
	User struct {
		Id           uuid.UUID `json:"id" db:"id"`
		FirstName    string    `json:"first_name" db:"first_name"`
		LastName     string    `json:"last_name" db:"last_name"`
		Email        string    `json:"email" db:"email"`
		PasswordHash string    `json:"password_hash" db:"password_hash"`
		UserRole     UserRole  `json:"role" db:"user_role"`
		CreatedAt    time.Time `json:"created_at" db:"created_at"`
		UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
	}

	UserWithInvitation struct {
		User            User      `json:"user" db:"user"`
		Password        string    `json:"password" db:"password"`
		InvitationId    uuid.UUID `json:"invitation_id" db:"invitation_id"`
		InvitationToken string    `json:"invitation_token" db:"invitation_token"`
	}

	UserWithPassword struct {
		User     User   `json:"user" db:"user"`
		Password string `json:"password" db:"password"`
	}

    ChangeUserDataRequest struct {
        CurrentEmail    string  `json:"current_email"`
        NewEmail        string  `json:"new_email"`
        FirstName       string  `json:"first_name"`
        LastName        string  `json:"last_name"`
    }

	UserRole string
)

const (
	Admin      UserRole = "admin"
	Instructor UserRole = "instructor"
	Assistant  UserRole = "assistant"
	Student    UserRole = "student"
)
