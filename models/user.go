package models

import (
	"fmt"
	"net/mail"

	"github.com/google/uuid"
)

type (
	User struct {
		Id           uuid.UUID    `json:"id"`
		FirstName    string       `json:"first_name"`
		LastName     string       `json:"last_name"`
		Email        mail.Address `json:"email"`
		PasswordHash string       `json:"password_hash"`
		Role         UserRole     `json:"role"`
		CreatedAt    string       `json:"created_at"`
		UpdatedAt    string       `json:"updated_at"`
	}

	UserWithInvitation struct {
		User            User   `json:"user"`
		Password        string `json:"password"`
		InvitationId    string `json:"invitation_id"`
		InvitationToken string `json:"invitation_token"`
	}

	UserWithPassword struct {
		User     User   `json:"user"`
		Password string `json:"password"`
	}

	UserRole int
)

const (
	Admin UserRole = iota
	Instructor
	Assistant
	Student
)

func (ur *UserRole) Scan(role string) error {
	switch role {
	case "admin":
		*ur = Admin
	case "instructor":
		*ur = Instructor
	case "assistant":
		*ur = Assistant
	case "student":
		*ur = Student
	default:
		return fmt.Errorf("invalid UserRole: %s", role)
	}
	return nil
}
