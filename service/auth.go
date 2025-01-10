package service

import (
	"fmt"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/email"
	"github.com/UDCS/Autograder/utils/jwt_token"
	"github.com/UDCS/Autograder/utils/password"
	"github.com/UDCS/Autograder/utils/token"
)

func (app *GraderApp) CreateInvitation(jwksToken string, invitation models.Invitation) (*models.InvitationWithToken, error) {
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
	app.store.CreateInvitation(invitation)

	return nil, nil
}

func (app *GraderApp) SignUp(userWithInvitation models.UserWithInvitation) (*models.JWTTokenDetails, error) {
	retrievedUser, _ := app.store.GetUserInfo(userWithInvitation.User.Email)
	if retrievedUser != nil {
		return nil, fmt.Errorf("user already exists")
	}

	// TODO
	// retrieve invitation by checking if the invitation is valid using the `invitation_id` and `token`
	// get the role from the invitation
	// hash the given password
	// store the user in the database with the role
	return nil, nil
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
