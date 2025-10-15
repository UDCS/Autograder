package service

import (
	"fmt"
	"net/mail"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/UDCS/Autograder/utils/email"
	"github.com/UDCS/Autograder/utils/jwt_token"
	"github.com/UDCS/Autograder/utils/logger"
	"github.com/UDCS/Autograder/utils/password"
	"github.com/UDCS/Autograder/utils/token"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (app *GraderApp) CreateInvitation(jwksToken string, invitation models.Invitation) (*models.Invitation, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return nil, fmt.Errorf("invalid autorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return nil, fmt.Errorf("unauthorized: only an admin or an instructor can invite users")
	}

	if claims.Role != models.Admin && invitation.UserRole == models.Admin {
		return nil, fmt.Errorf("unauthorized: only an admin can grant `admin` role")
	}
	_, err = app.store.GetUserInfo(invitation.Email)
	if err == nil {
		return nil, fmt.Errorf("user already exists")
	}

	token, tokenHash, err := token.GenerateRandomTokenAndHash()
	if err != nil {
		return nil, err
	}

	baseUrl := config.GetBaseURL()

	// TODO: email the invitation with the link containg both token and invitation I
	//email.Send("auth/register/" + invitation.Id.String() + "?token=" + token)
	//msg := "Subject: Create an Autograder Account\n\nYour professor has invited you to create an Autograder account.\n\nYou may create the account be visitting auth/regiser/" + invitation.Id.String() + "?token=" + token + "\n\nThis email cannot be replied to. If you have any questions, please contact your professor."
	msg := fmt.Sprintf("Subject: Create an Autograder Account\nYour professor has invited you to create an Autograder account.\n\nYou may create the account be visiting %s/signup?id=%s&token=%s\n\nThis email cannot be replied to. If you have any questions, please contact your professor.", baseUrl, invitation.Id.String(), token)
	err = email.Send(invitation.Email, msg)
	if err != nil {
		fmt.Print(err.Error())
		return nil, err
	}

	invitation.TokenHash = tokenHash
	invitation.ExpiresAt = time.Now().AddDate(0, 0, 7)
	createdInvitation, err := app.store.CreateInvitation(invitation)

	if err != nil {
		logger.Error("failed to update the database", zap.Error(err))
		return nil, err
	}

	return createdInvitation, nil
}

func (app *GraderApp) InviteAdmin(invitation models.Invitation) (*models.Invitation, error) {
	_, err := app.store.GetUserInfo(invitation.Email)
	if err == nil {
		return nil, fmt.Errorf("user already exists")
	}

	token, tokenHash, err := token.GenerateRandomTokenAndHash()
	if err != nil {
		return nil, err
	}

	// TODO: email the invitation with the link containg both token and invitation I
	//email.Send("auth/register/" + invitation.Id.String() + "?token=" + token)
	/*msg :=
	"Subject: Create an Admin Autograder Account\n\nAn Autograder admin has invited you to create an admin Autograder account.\n\nYou may create the account be visitting auth/regiser/"
	+ invitation.Id.String() + "?token=" + token +
	"\n\nThis email cannot be replied to. If you have any questions, please contact the admin."*/
	baseUrl := config.GetBaseURL()
	msg := fmt.Sprintf("Subject: Create an Admin Autograder Account\nAn Autograder admin has invited you to create an Autograder account.\n\nYou may create the account be visiting %s/signup?id=%s&token=%s\n\nThis email cannot be replied to. If you have any questions, please contact the admin.", baseUrl, invitation.Id.String(), token)
	err = email.Send(invitation.Email, msg)

	if err != nil {
		return nil, err
	}

	invitation.TokenHash = tokenHash
	invitation.ExpiresAt = time.Now().AddDate(0, 0, 14)
	createdInvitation, err := app.store.CreateInvitation(invitation)

	if err != nil {
		logger.Error("failed to update the database", zap.Error(err))
		return nil, err
	}

	return createdInvitation, nil
}

func (app *GraderApp) SignUp(userWithInvitation models.UserWithInvitation, session models.Session) (*models.JWTTokens, error) {
	tokenHash := token.HashToken(userWithInvitation.InvitationToken)
	retrievedInvitation, err := app.store.GetInvitation(userWithInvitation.InvitationId, tokenHash)
	if err != nil {
		return nil, fmt.Errorf("invitation not found")
	}

	_, err = app.store.GetUserInfo(retrievedInvitation.Email)
	if err == nil {
		return nil, fmt.Errorf("user already exists")
	}

	if time.Now().After(retrievedInvitation.ExpiresAt) {
		return nil, fmt.Errorf("invitation has expired")
	}

	if retrievedInvitation.Completed {
		return nil, fmt.Errorf("invitation has already been accepted")
	}

	hashedPassword, err := password.HashPassword([]byte(userWithInvitation.Password))
	if err != nil {
		return nil, fmt.Errorf("could not hash password")
	}

	newUser := userWithInvitation.User
	newUser.Email = retrievedInvitation.Email
	newUser.UserRole = retrievedInvitation.UserRole
	newUser.PasswordHash = hashedPassword

	createdUser, err := app.store.CreateUser(newUser)
	if err != nil {
		return nil, fmt.Errorf("failed to update the database: %v", err)
	}

	err = app.store.CompleteInvitation(retrievedInvitation.Id, true, time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to update the database: %v", err)
	}

	tokenDetails, err := jwt_token.CreateJWTTokens(createdUser.Email, createdUser.UserRole, app.authConfig.JWT)
	if err != nil {
		return nil, fmt.Errorf("failed to create JWT tokens: %v", err)
	}

	session.UserEmail = createdUser.Email
	session.UserRole = createdUser.UserRole
	session.TokenHash = token.HashToken(tokenDetails.RefreshToken.TokenString)
	session.ExpiresAt = tokenDetails.RefreshToken.ExpiresAt

	_, err = app.store.CreateSession(session)
	if err != nil {
		logger.Error("failed to set up a session", zap.Error(err))
	}

	classroomInfo, err := app.store.GetClassroomInfo(retrievedInvitation.ClassroomId)
	if err == nil {
		err = app.store.MatchUserToClassroom(createdUser.Email, string(createdUser.UserRole), classroomInfo.Id)
		if err != nil {
			return nil, err
		}
	}

	return tokenDetails, nil
}

func (app *GraderApp) Login(userWithPassword models.UserWithPassword, session models.Session) (*models.JWTTokens, error) {
	retrievedUser, err := app.store.GetUserInfo(userWithPassword.User.Email)
	if err != nil {
		return nil, fmt.Errorf("error retrieving user's info: %v", err)
	}

	validCredentials := password.ComparePasswords(retrievedUser.PasswordHash, userWithPassword.Password)
	if !validCredentials {
		return nil, fmt.Errorf("invalid credentials")
	}

	tokenDetails, err := jwt_token.CreateJWTTokens(retrievedUser.Email, retrievedUser.UserRole, app.authConfig.JWT)
	if err != nil {
		return nil, fmt.Errorf("failed to create JWT tokens: %v", err)
	}

	session.UserId = retrievedUser.Id
	session.UserRole = retrievedUser.UserRole
	session.TokenHash = token.HashToken(tokenDetails.RefreshToken.TokenString)
	session.ExpiresAt = tokenDetails.RefreshToken.ExpiresAt
	_, err = app.store.CreateSession(session)
	if err != nil {
		logger.Error("failed to set up a session", zap.Error(err))
	}

	return tokenDetails, nil
}

func (app *GraderApp) Logout(sessionId uuid.UUID) error {
	return app.store.DeleteSession(sessionId)
}

func (app *GraderApp) PasswordResetRequest(jwksToken string) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("failed to parse access token")
	}
	parsedEmail, err := mail.ParseAddress(claims.Subject)
	if err != nil {
		logger.Error("failed to parse email", zap.Error(err))
		return fmt.Errorf("failed to parse email")
	}

	resetRequest := models.PasswordResetDetails{
		Id:        uuid.New(),
		Email:     parsedEmail.Address,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	retrievedUser, err := app.store.GetUserInfo(resetRequest.Email)
	if err != nil {
		return fmt.Errorf("user does not exist")
	}

	token, tokenHash, err := token.GenerateRandomTokenAndHash()
	if err != nil {
		return err
	}

	// TODO: email the link for the change
	//email.Send("auth/reset_password/" + resetRequest.Id.String() + "?token=" + token)
	msg := fmt.Sprintf("Password Reset Link\nPlease visit the following link to reset your password: https://udcs-autograder.web.app/auth/reset_password/%s?token=%s", resetRequest.Id.String(), token)
	email.Send(resetRequest.Email, msg)

	resetRequest.UserId = retrievedUser.Id
	resetRequest.TokenHash = tokenHash
	resetRequest.ExpiresAt = time.Now().AddDate(0, 0, 7)

	err = app.store.CreatePasswordChangeRequest(resetRequest)

	if err != nil {
		logger.Error("failed to update the database", zap.Error(err))
		return err
	}

	return nil
}

func (app *GraderApp) PasswordReset(details models.NewPasswordDetails, session models.Session) (*models.JWTTokens, error) {
	tokenHash := token.HashToken(details.RequestToken)
	retrievedResetRequest, err := app.store.GetPasswordChangeRequest(details.RequestId, tokenHash)
	if err != nil {
		return nil, fmt.Errorf("password change request was not found")
	}

	if time.Now().After(retrievedResetRequest.ExpiresAt) {
		return nil, fmt.Errorf("password change request has expired")
	}

	if retrievedResetRequest.Completed {
		return nil, fmt.Errorf("password change request has already been used")
	}

	hashedPassword, err := password.HashPassword([]byte(details.NewPassword))
	if err != nil {
		return nil, fmt.Errorf("could not hash password")
	}

	updateTime := time.Now()
	updatedUser, err := app.store.UpdateUserPassword(retrievedResetRequest.UserId, hashedPassword, updateTime)
	if err != nil {
		return nil, fmt.Errorf("failed to update the database: %v", err)
	}

	err = app.store.CompletePasswordChangeRequest(details.RequestId, true, updateTime)
	if err != nil {
		return nil, fmt.Errorf("failed to update the database: %v", err)
	}

	tokenDetails, err := jwt_token.CreateJWTTokens(updatedUser.Email, updatedUser.UserRole, app.authConfig.JWT)
	if err != nil {
		return nil, fmt.Errorf("failed to create JWT token: %v", err)
	}

	session.UserId = updatedUser.Id
	session.UserEmail = updatedUser.Email
	session.UserRole = updatedUser.UserRole
	session.TokenHash = token.HashToken(tokenDetails.RefreshToken.TokenString)
	session.ExpiresAt = tokenDetails.RefreshToken.ExpiresAt

	_, err = app.store.CreateSession(session)
	if err != nil {
		logger.Error("failed to set up a session", zap.Error(err))
	}

	return tokenDetails, nil
}

func (app *GraderApp) RefreshToken(refreshTokenString string) (*models.AccessToken, error) {
	refreshTokenClaims, err := jwt_token.ParseRefreshTokenString(refreshTokenString, app.authConfig.JWT.Secret)
	if err != nil {
		return nil, fmt.Errorf("invalid autorization credentials")
	}

	hashedString := token.HashToken(refreshTokenString)
	session, err := app.store.GetSession(refreshTokenClaims.Subject, hashedString)
	if err != nil {
		return nil, fmt.Errorf("session not found")
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("invalid refresh token")
	}

	accessTokenString, accessTokenExpiration, err := jwt_token.CreateAccessTokenString(session.UserEmail, session.UserRole, app.authConfig.JWT.AccessTokenDuration, app.authConfig.JWT.Secret)
	if err != nil {
		return nil, fmt.Errorf("failed to create access token: %v", err)
	}

	accessToken := &models.AccessToken{
		TokenString: accessTokenString,
		ExpiresAt:   accessTokenExpiration,
	}

	return accessToken, nil
}

func (app *GraderApp) GetClassroomsOfUser(jwksToken string) ([]models.Classroom, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return nil, fmt.Errorf("invalid authorization credentials")
	}

	classrooms, err := app.store.GetClassroomsOfUser(claims.Subject)
	if err != nil {
		return nil, err
	}

	return classrooms, nil
}

func (app *GraderApp) GetUserName(jwksToken string) (*models.UserName, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return nil, fmt.Errorf("failed to parse access token")
	}
	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve user info")
	}
	return &models.UserName{FirstName: userInfo.FirstName, LastName: userInfo.LastName}, nil
}

func (app *GraderApp) ChangeUserInfo(jwksToken string, request models.ChangeUserInfoRequest) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorizaiton credentials")
	}

	if request.Email == "" {
		request.Email = claims.Subject
	}

	if claims.Role != models.Admin && request.Email != claims.Subject {
		return fmt.Errorf("unauthorized: only an admin can change another user's info")
	}

	return app.store.ChangeUserInfo(request)
}

func (app *GraderApp) IsValidLogin(jwksToken string) bool {
	_, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	return err == nil
}

func (app *GraderApp) ValidInvite(inviteId uuid.UUID, tokenString string) bool {
	tokenHash := token.HashToken(tokenString)
	return app.store.ValidInvite(inviteId, tokenHash)
}

func (app *GraderApp) GetRole(jwksToken string) (models.UserRole, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return "", fmt.Errorf("invalid authorization credentials")
	}
	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return "", err
	}
	return app.store.GetRole(userInfo.Id)
}
