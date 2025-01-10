package service

import (
	"fmt"
	"log"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/email"
	"github.com/UDCS/Autograder/utils/jwt_token"
	"github.com/UDCS/Autograder/utils/password"
	"github.com/UDCS/Autograder/utils/token"
)

func (app *GraderApp) CreateInvitation(jwksToken string, invitation models.Invitation) (*models.Invitation, error) {
	claims, err := jwt_token.ParseTokenString(jwksToken, app.authConfig.JWTSecret)
	if err != nil {
		return nil, fmt.Errorf("invalid autorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return nil, fmt.Errorf("unauthorized: only an admin or an instructor can invite users")
	}

	if claims.Role != models.Admin && invitation.UserRole == models.Admin {
		return nil, fmt.Errorf("unauthorized: only an admin can grant `admin` role")
	}

	retrievedUser, _ := app.store.GetUserInfo(invitation.Email)
	if retrievedUser != nil {
		return nil, fmt.Errorf("user already exists")
	}

	token, tokenHash, err := token.GenerateRandomTokenAndHash()
	if err != nil {
		return nil, err
	}

	// TODO: email the invitation with the token
	email.Send(token)

	invitation.TokenHash = tokenHash
	invitation.ExpiresAt = time.Now().AddDate(0, 0, 7).Format(time.RFC3339)
	createdInvitation, err := app.store.CreateInvitation(invitation)

	if err != nil {
		log.Fatalf("failed to update the database: %v", err)
		return nil, err
	}

	return createdInvitation, nil
}

func (app *GraderApp) SignUp(userWithInvitation models.UserWithInvitation) (*models.JWTTokenDetails, error) {
	retrievedUser, _ := app.store.GetUserInfo(userWithInvitation.User.Email)
	if retrievedUser != nil {
		return nil, fmt.Errorf("user already exists")
	}

	tokenHash := token.HashToken(userWithInvitation.InvitationToken)
	retrievedInvitation, err := app.store.GetInvitation(userWithInvitation.InvitationId, tokenHash)
	if err != nil {
		return nil, fmt.Errorf("invitation not found")
	}

	hashedPassword, err := password.HashPassword([]byte(userWithInvitation.Password))
	if err != nil {
		return nil, fmt.Errorf("could not hash password")
	}

	newUser := userWithInvitation.User
	newUser.Email = retrievedInvitation.Email
	newUser.Role = retrievedInvitation.UserRole
	newUser.PasswordHash = hashedPassword

	createdUser, err := app.store.CreateUser(newUser)

	if err != nil {
		return nil, fmt.Errorf("failed to update the database: %v", err)
	}
	tokenDetails, err := jwt_token.CreateJWTToken(createdUser.Email.Address, createdUser.Role, app.authConfig.JWTSecret)

	return tokenDetails, err
}

func (app *GraderApp) Login(userWithPassword models.UserWithPassword) (*models.JWTTokenDetails, error) {
	retrievedUser, err := app.store.GetUserInfo(userWithPassword.User.Email)
	if err != nil {
		return nil, fmt.Errorf("error retrieving user's info: %v", err)
	}

	validCredentials := password.ComparePasswords(retrievedUser.PasswordHash, userWithPassword.Password)
	if !validCredentials {
		return nil, fmt.Errorf("invalid credentials")
	}

	tokenDetails, err := jwt_token.CreateJWTToken(retrievedUser.Email.Address, retrievedUser.Role, app.authConfig.JWTSecret)

	return tokenDetails, err
}
