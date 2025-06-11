package handler

import (
	"net/http"
	"time"

	"net/mail"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/json_response"

	"github.com/UDCS/Autograder/utils/logger"
	"github.com/UDCS/Autograder/utils/middlewares"
	"github.com/UDCS/Autograder/utils/password"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

func (router *HttpRouter) CreateInvitation(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)
	if err != nil {
		logger.Error("failed to parse cookie for `access_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	request := CreateInvitationRequest{}
	err = c.Bind(&request)
	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnprocessableEntity, json_response.NewError("failed to parse request body"))
	}

	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil {
		logger.Error("failed to parse email", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError("failed to parse email"))
	}

	invitation := models.Invitation{
		Id:          uuid.New(),
		Email:       parsedEmail.Address,
		UserRole:    request.UserRole,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		ClassroomId: request.ClassroomId,
	}

	invitationWithToken, err := router.app.CreateInvitation(tokenString, invitation)
	if err != nil {
		logger.Error("failed to create invitation", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, "failed to create invitation")
	}
	return c.JSON(http.StatusCreated, invitationWithToken)
}
func (router *HttpRouter) SignUp(c echo.Context) error {
	invitationId := c.Param("invitationId")
	parsedInvitationId, err := uuid.Parse(invitationId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError("failed to parse invitation id"))
	}

	invitationToken := c.QueryParam("token")

	request := SignUpRequest{}
	err = c.Bind(&request)
	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnprocessableEntity, json_response.NewError("failed to parse request body"))
	}

	user := models.User{
		Id:        uuid.New(),
		FirstName: request.FirstName,
		LastName:  request.LastName,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	parsedPassword, err := password.CheckPasswordSecurity(request.Password)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	UserWithInvitation := models.UserWithInvitation{
		User:            user,
		Password:        parsedPassword,
		InvitationId:    parsedInvitationId,
		InvitationToken: invitationToken,
	}

	session := models.Session{
		Id:        uuid.New(),
		UserId:    user.Id,
		CreatedAt: time.Now(),
	}

	generatedTokenDetails, err := router.app.SignUp(UserWithInvitation, session)

	if err != nil {
		logger.Error("sign up failed", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, json_response.NewError("sign up failed"))
	}

	c.SetCookie(&http.Cookie{
		Name:     "access_token",
		Value:    generatedTokenDetails.AccessToken.TokenString,
		Path:     "/",
		Expires:  generatedTokenDetails.AccessToken.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})
	c.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    generatedTokenDetails.RefreshToken.TokenString,
		Path:     "/",
		Expires:  generatedTokenDetails.RefreshToken.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})
	c.SetCookie(&http.Cookie{
		Name:     "session_id",
		Value:    session.Id.String(),
		Path:     "/",
		Expires:  generatedTokenDetails.RefreshToken.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})

	return c.JSON(http.StatusOK, json_response.NewMessage("registration successful"))
}

func (router *HttpRouter) CreateInvitationFromRequest(c echo.Context, request CreateInvitationRequest) error {
	tokenString, err := middlewares.GetAccessToken(c)
	if err != nil {
		logger.Error("failed to parse cookie for `access_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil {
		logger.Error("failed to parse email", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError("failed to parse email"))
	}

	invitation := models.Invitation{
		Id:          uuid.New(),
		Email:       parsedEmail.Address,
		UserRole:    request.UserRole,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		ClassroomId: request.ClassroomId,
	}

	invitationWithToken, err := router.app.CreateInvitation(tokenString, invitation)
	if err != nil {
		logger.Error("failed to create invitation", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, "failed to create invitation")
	}
	return c.JSON(http.StatusCreated, invitationWithToken)
}

func (router *HttpRouter) MatchUsersToClassroom(c echo.Context) error {

	tokenString, err := middlewares.GetAccessToken(c)

	if err != nil {
		logger.Error("failed to parse cookie for `access_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	classroomId := c.Param("room_id")
	classroomUuid, err := uuid.Parse(classroomId)

	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError("Invalid UUID"))
	}
	var users struct {
		RoomUsers []models.AddToClassRequest `json:"users"`
	}
	if err := c.Bind(&users); err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}
	for _, user := range users.RoomUsers {
		userEmail := user.User_email
		userRole := user.User_role
		err := router.app.MatchUserToClassroom(tokenString, userEmail, userRole, classroomUuid)
		if err != nil {
			if err.Error() == "user does not exist" {
				invitationRequest := CreateInvitationRequest{
					Email:       userEmail,
					UserRole:    models.UserRole(userRole),
					ClassroomId: classroomUuid,
				}
				router.CreateInvitationFromRequest(c, invitationRequest)
			} else {
				return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
			}
		}
	}

	return c.JSON(http.StatusOK, json_response.NewMessage("users successfully added to classroom"))
}

func (router *HttpRouter) Login(c echo.Context) error {
	request := LoginRequest{}
	err := c.Bind(&request)
	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnprocessableEntity, json_response.NewError("failed to parse request body"))
	}

	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil {
		logger.Error("failed to parse email", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError("failed to parse email"))
	}

	user := models.User{
		Email:     parsedEmail.Address,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	userWithPassword := models.UserWithPassword{
		User:     user,
		Password: request.Password,
	}

	session := models.Session{
		Id:        uuid.New(),
		UserEmail: user.Email,
		UserRole:  user.UserRole,
		CreatedAt: time.Now(),
	}

	generatedTokenDetails, err := router.app.Login(userWithPassword, session)

	if err != nil {
		logger.Error("login failed", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, json_response.NewError("login failed"))
	}

	c.SetCookie(&http.Cookie{
		Name:     "access_token",
		Value:    generatedTokenDetails.AccessToken.TokenString,
		Path:     "/",
		Expires:  generatedTokenDetails.AccessToken.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})
	c.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    generatedTokenDetails.RefreshToken.TokenString,
		Path:     "/",
		Expires:  generatedTokenDetails.RefreshToken.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})
	c.SetCookie(&http.Cookie{
		Name:     "session_id",
		Value:    session.Id.String(),
		Path:     "/",
		Expires:  generatedTokenDetails.RefreshToken.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})

	return c.JSON(http.StatusOK, json_response.NewMessage("login successful"))
}

func (router *HttpRouter) Logout(c echo.Context) error {
	sessionIdCookie, err := c.Cookie("session_id")
	if err != nil {
		logger.Error("failed to parse session Id", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError("failed to parse session id"))
	}
	sessionId := sessionIdCookie.Value
	parsedId, err := uuid.Parse(sessionId)
	if err != nil {
		logger.Error("failed to parse session id", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError("failed to parse session id"))
	}

	c.SetCookie(&http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Now().Add(-1 * time.Hour),
		Secure:   true,
		HttpOnly: true,
	})
	c.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Now().Add(-1 * time.Hour),
		Secure:   true,
		HttpOnly: true,
	})
	c.SetCookie(&http.Cookie{
		Name:     "session_id",
		Value:    "",
		Path:     "/",
		Expires:  time.Now().Add(-1 * time.Hour),
		Secure:   true,
		HttpOnly: true,
	})

	err = router.app.Logout(parsedId)
	if err != nil {
		logger.Error("failed to logout", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, json_response.NewError("failed to logout"))
	}

	return c.JSON(http.StatusOK, json_response.NewMessage("logout successful"))
}

func (router *HttpRouter) PasswordResetRequest(c echo.Context) error {

	tokenString, err := middlewares.GetAccessToken(c)
	if err != nil {
		logger.Error("failed to parse access token", zap.Error(err))
		return c.JSON(http.StatusUnprocessableEntity, json_response.NewError("failed to parse request body"))
	}

	err = router.app.PasswordResetRequest(tokenString)
	if err != nil {
		logger.Error("failed to create a password reset request", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, json_response.NewError("failed to create a password reset request"))
	}
	return c.JSON(http.StatusAccepted, json_response.NewMessage("password reset request accepted"))
}

func (router *HttpRouter) PasswordReset(c echo.Context) error {
	requestId := c.Param("requestId")
	token := c.QueryParam("token")

	request := NewPasswordRequest{}

	err := c.Bind(&request)
	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnprocessableEntity, json_response.NewError("failed to parse request body"))
	}

	parsedPassword, err := password.CheckPasswordSecurity(request.NewPassword)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	parsedId, err := uuid.Parse(requestId)
	if err != nil {
		logger.Error("failed to parse request id", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError("failed to parse request id"))
	}

	newPasswordDetails := models.NewPasswordDetails{
		RequestId:    parsedId,
		RequestToken: token,
		NewPassword:  parsedPassword,
	}

	session := models.Session{
		Id:        uuid.New(),
		CreatedAt: time.Now(),
	}

	generatedTokenDetails, err := router.app.PasswordReset(newPasswordDetails, session)

	if err != nil {
		logger.Error("login failed", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, json_response.NewError("login failed"))
	}

	c.SetCookie(&http.Cookie{
		Name:     "access_token",
		Value:    generatedTokenDetails.AccessToken.TokenString,
		Path:     "/",
		Expires:  generatedTokenDetails.AccessToken.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})
	c.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    generatedTokenDetails.RefreshToken.TokenString,
		Path:     "/",
		Expires:  generatedTokenDetails.RefreshToken.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})
	c.SetCookie(&http.Cookie{
		Name:     "session_id",
		Value:    session.Id.String(),
		Path:     "/",
		Expires:  generatedTokenDetails.RefreshToken.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})

	return c.JSON(http.StatusOK, echo.Map{"message": "password reset successful"})
}

func (router *HttpRouter) RefreshToken(c echo.Context) error {
	refreshTokenString, err := middlewares.GetRefreshToken(c)
	if err != nil {
		logger.Error("failed to parse cookie for `refresh_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	accessTokenDetails, err := router.app.RefreshToken(refreshTokenString)
	if err != nil {
		logger.Error("failed to refresh the access token", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, "failed to refresh the access token")
	}

	c.SetCookie(&http.Cookie{
		Name:     "access_token",
		Value:    accessTokenDetails.TokenString,
		Path:     "/",
		Expires:  accessTokenDetails.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	})

	return c.JSON(http.StatusOK, json_response.NewMessage("token refreshed"))
}

func (router *HttpRouter) GetClassroomsOfUser(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)

	if err != nil {
		logger.Error("failed to parse cookie for `access_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	classrooms, err := router.app.GetClassroomsOfUser(tokenString)

	if err != nil {
		logger.Error("could not find user", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError(err.Error()))
	}

	return c.JSON(http.StatusOK, echo.Map{"classrooms": classrooms})
}

func (router *HttpRouter) GetUserName(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)
	if err != nil {
		logger.Error("could not find access token", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("could not find access token"))
	}
	userName, err := router.app.GetUserName(tokenString)
	return c.JSON(http.StatusOK, echo.Map{"FirstName": userName.FirstName, "LastName": userName.LastName})
}

func (router *HttpRouter) ChangeUserData(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)

	if err != nil {
		logger.Error("could not find access token", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("could not find access token"))
	}

	var request models.ChangeUserDataRequest

	err = c.Bind(&request)

	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnprocessableEntity, json_response.NewError("failed to parse request body"))
	}

	_, err = mail.ParseAddress(request.NewEmail)

	if err != nil {
		logger.Error("failed to parse email", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError("new_email is invalid"))
	}

	err = router.app.ChangeUserData(tokenString, request)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}
	return c.JSON(http.StatusAccepted, json_response.NewMessage("successfully changed user data"))
}

func (router *HttpRouter) IsValidLogin(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)
	if err != nil {
		return c.JSON(http.StatusOK, json_response.NewMessage("false"))
	}
	if router.app.IsValidLogin(tokenString) {
		return c.JSON(http.StatusOK, json_response.NewMessage("true"))
	}
	return c.JSON(http.StatusOK, json_response.NewMessage("false"))
}

type (
	CreateInvitationRequest struct {
		Email       string          `json:"email"`
		UserRole    models.UserRole `json:"user_role"`
		ClassroomId uuid.UUID       `json:"classroom_id"`
	}

	SignUpRequest struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Password  string `json:"password"`
	}

	LoginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	PasswordResetRequest struct {
		Email string `json:"email"`
	}

	NewPasswordRequest struct {
		NewPassword string `json:"password"`
	}
)
