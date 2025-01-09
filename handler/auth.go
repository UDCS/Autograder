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
	claims, err := middlewares.IsAuthorized(c, router.authConfig.JWTSecret)
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
		Email:     *parsedEmail,
		ID:        uuid.New(),
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
		ExpiresAt: time.Now().AddDate(0, 0, 7).Format(time.RFC3339), // expires 7 days from now
	}

	invitationWithToken, err := router.app.CreateInvitation(claims, *invitation)
	if err != nil {
		log.Fatalf("failed to create invitation: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to create invitation"})
	}
	return c.JSON(http.StatusCreated, invitationWithToken)
}

func (router *HttpRouter) SignUp(c echo.Context) error {
	request := SignUpRequest{}
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
		ID:        uuid.New(),
		Email:     *parsedEmail,
		FirstName: request.FirstName,
		LastName:  request.LastName,
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	parsedPassword, err := password.CheckPasswordSecurity(request.Password)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	userWithPassword := &models.UserWithInvitation{
		User:     *user,
		Password: parsedPassword,
	}

	generatedTokenDetails, err := router.app.SignUp(*userWithPassword)

	if err != nil {
		log.Fatalf("registration failed: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "registration failed"})
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
		ID:        uuid.New(),
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

func (router *HttpRouter) PasswordReset(c echo.Context) error {
	// TODO
	return nil
}

type (
	CreateInvitationRequest struct {
		Email    string `json:"email"`
		UserRole string `json:"user_role"`
	}

	SignUpRequest struct {
		Email     string `json:"email"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Password  string `json:"password"`
	}

	LoginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
)
