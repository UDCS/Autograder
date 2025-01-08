package service

import (
	"fmt"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/password"
)

func (app *GraderApp) CreateInvitation(invitation models.Invitation) (models.InvitationWithToken, error) {
	// TODO
	// take user's role in request
	// generate a token
	// email the invitation with the token
	// store the token hash and invtiation in database

	return models.InvitationWithToken{}, nil
}

func (app *GraderApp) SignUp(user models.UserWithInvitation) error {
	// TODO
	// check if the invitation is valid
	// hash the password
	// store the user in the database with the role
	return nil
}

func (app *GraderApp) Login(userWithPassword models.UserWithPassword) error {
	retrievedUser, err := app.store.GetUserInfo(userWithPassword.User.Email)
	if err != nil {
		return fmt.Errorf("error retrieving user's info: %v", err)
	}

	validCredentials := password.ComparePasswords(retrievedUser.PasswordHash, userWithPassword.Password)
	if !validCredentials {
		return fmt.Errorf("invalid credentials")
	}

	// TODO: JWT token generation

	return nil
}

func (app *GraderApp) Logout(user models.User) error {

	return nil
}
