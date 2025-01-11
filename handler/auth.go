package handler

import (
	"log"
	"net/http"
	"time"

	"net/mail"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/middlewares"
	"github.com/UDCS/Autograder/utils/password"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (router *HttpRouter) CreateInvitation(c echo.Context) error {
	tokenString, err := middlewares.ParseCookie(c)
	if err != nil {
		log.Fatalf("failed to parse cookie: %v", err)
		return c.JSON(401, echo.Map{"error": "unauthorized"})
	}

	request := CreateInvitationRequest{}
	err = c.Bind(&request)
	if err != nil {
		log.Fatalf("failed to parse request body: %v", err)
		return c.JSON(http.StatusUnprocessableEntity, echo.Map{"error": "failed to parse request body"})
	}

	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil {
		log.Fatalf("failed to parse email: %v", err)
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "failed to parse email"})
	}

	invitation := &models.Invitation{
		Id:        uuid.New(),
		Email:     *parsedEmail,
		UserRole:  request.UserRole,
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	invitationWithToken, err := router.app.CreateInvitation(tokenString, *invitation)
	if err != nil {
		log.Fatalf("failed to create invitation: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to create invitation"})
	}
	return c.JSON(http.StatusCreated, invitationWithToken)
}

func (router *HttpRouter) SignUp(c echo.Context) error {
	invitationId := c.Param("invitationId")
	invitationToken := c.QueryParam("token")

	request := SignUpRequest{}

	user := models.User{
		Id:        uuid.New(),
		FirstName: request.FirstName,
		LastName:  request.LastName,
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	parsedPassword, err := password.CheckPasswordSecurity(request.Password)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	UserWithInvitation := models.UserWithInvitation{
		User:            user,
		Password:        parsedPassword,
		InvitationId:    invitationId,
		InvitationToken: invitationToken,
	}

	generatedTokenDetails, err := router.app.SignUp(UserWithInvitation)

	if err != nil {
		log.Fatalf("login failed: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "login failed"})
	}

	cookie := &http.Cookie{
		Name:     "token",
		Value:    generatedTokenDetails.TokenString,
		Path:     "/",
		Expires:  generatedTokenDetails.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, echo.Map{"message": "registration successful"})
}

func (router *HttpRouter) Login(c echo.Context) error {
	request := LoginRequest{}
	err := c.Bind(&request)
	if err != nil {
		log.Fatalf("failed to parse request body: %v", err)
		return c.JSON(http.StatusUnprocessableEntity, echo.Map{"error": "failed to parse request body"})
	}

	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil {
		log.Fatalf("failed to parse email: %v", err)
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "failed to parse email"})
	}

	user := &models.User{
		Id:        uuid.New(),
		Email:     *parsedEmail,
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	userWithPassword := &models.UserWithPassword{
		User:     *user,
		Password: request.Password,
	}

	generatedTokenDetails, err := router.app.Login(*userWithPassword)

	if err != nil {
		log.Fatalf("login failed: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "login failed"})
	}

	cookie := &http.Cookie{
		Name:     "token",
		Value:    generatedTokenDetails.TokenString,
		Path:     "/",
		Expires:  generatedTokenDetails.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, echo.Map{"message": "login successful"})
}

func (router *HttpRouter) Logout(c echo.Context) error {
	cookie := &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		Expires:  time.Now(),
		Secure:   true,
		HttpOnly: true,
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, echo.Map{"message": "logout successful"})
}

func (router *HttpRouter) PasswordResetRequest(c echo.Context) error {
	request := PasswordResetRequest{}

	err := c.Bind(&request)
	if err != nil {
		log.Fatalf("failed to parse request body: %v", err)
		return c.JSON(http.StatusUnprocessableEntity, echo.Map{"error": "failed to parse request body"})
	}

	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil {
		log.Fatalf("failed to parse email: %v", err)
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "failed to parse email"})
	}

	resetRequest := models.PasswordResetDetails{
		Id:        uuid.New(),
		Email:     *parsedEmail,
		CreatedAt: time.Now().Format(time.RFC3339),
	}

	err = router.app.PasswordResetRequest(resetRequest)
	if err != nil {
		log.Fatalf("failed to create a password reset request: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to create a password reset request"})
	}
	return c.JSON(http.StatusAccepted, echo.Map{"message": "password reset request accepted"})
}

func (router *HttpRouter) PasswordReset(c echo.Context) error {
	requestId := c.Param("requestId")
	token := c.QueryParam("token")

	request := NewPasswordRequest{}

	err := c.Bind(&request)
	if err != nil {
		log.Fatalf("failed to parse request body: %v", err)
		return c.JSON(http.StatusUnprocessableEntity, echo.Map{"error": "failed to parse request body"})
	}

	parsedPassword, err := password.CheckPasswordSecurity(request.NewPassword)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	newPasswordDetails := models.NewPasswordDetails{
		RequestId:    requestId,
		RequestToken: token,
		NewPassword:  parsedPassword,
	}

	generatedTokenDetails, err := router.app.PasswordReset(newPasswordDetails)

	if err != nil {
		log.Fatalf("login failed: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "login failed"})
	}

	cookie := &http.Cookie{
		Name:     "token",
		Value:    generatedTokenDetails.TokenString,
		Path:     "/",
		Expires:  generatedTokenDetails.ExpiresAt,
		Secure:   true,
		HttpOnly: true,
	}
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, echo.Map{"message": "password reset successful"})
}

type (
	CreateInvitationRequest struct {
		Email    string          `json:"email"`
		UserRole models.UserRole `json:"user_role"`
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
