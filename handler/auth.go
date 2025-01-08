package handler

import (
	"log"
	"net/http"
	"time"

	"net/mail"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/password"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (router *HttpRouter) CreateInvitation(c echo.Context) error {
	request := CreateInvitationRequest{}
	err := c.Bind(&request)
	if err != nil {
		log.Fatalf("failed to parse request body: %v", err)
		return echo.NewHTTPError(http.StatusUnprocessableEntity, "failed to parse request body")
	}

	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil {
		log.Fatalf("failed to parse email: %v", err)
		return echo.NewHTTPError(http.StatusBadRequest, "failed to parse email")
	}

	invitation := &models.Invitation{
		Email:     *parsedEmail,
		UserRole:  request.UserRole, // TODO: make roles an enum
		ID:        uuid.New(),
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
		ExpiresAt: time.Now().AddDate(0, 0, 7).Format(time.RFC3339), // expires 7 days from now
	}

	invitationWithToken, err := router.app.CreateInvitation(*invitation)
	if err != nil {
		log.Fatalf("failed to create invitation: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create invitation")
	}
	return c.JSON(http.StatusCreated, invitationWithToken)
}

func (router *HttpRouter) SignUp(c echo.Context) error {
	request := LoginRequest{}
	err := c.Bind(&request)
	if err != nil {
		log.Fatalf("failed to parse request body: %v", err)
		return echo.NewHTTPError(http.StatusUnprocessableEntity, "failed to parse request body")
	}

	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil {
		log.Fatalf("failed to parse email: %v", err)
		return echo.NewHTTPError(http.StatusBadRequest, "failed to parse email")
	}

	user := &models.User{
		ID:        uuid.New(),
		Email:     *parsedEmail,
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	parsedPassword, err := password.CheckPasswordSecurity(request.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	userWithPassword := &models.UserWithInvitation{
		User:     *user,
		Password: parsedPassword,
	}

	err = router.app.SignUp(*userWithPassword)

	if err != nil {
		log.Fatalf("registration failed: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "registration failed")
	}
	return c.JSON(http.StatusOK, "registration successful")
}

func (router *HttpRouter) Login(c echo.Context) error {
	request := LoginRequest{}
	err := c.Bind(&request)
	if err != nil {
		log.Fatalf("failed to parse request body: %v", err)
		return echo.NewHTTPError(http.StatusUnprocessableEntity, "failed to parse request body")
	}

	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil {
		log.Fatalf("failed to parse email: %v", err)
		return echo.NewHTTPError(http.StatusBadRequest, "failed to parse email")
	}

	user := &models.User{
		ID:        uuid.New(),
		Email:     *parsedEmail,
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	parsedPassword, err := password.CheckPasswordSecurity(request.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err)
	}

	userWithPassword := &models.UserWithPassword{
		User:     *user,
		Password: parsedPassword,
	}

	err = router.app.Login(*userWithPassword)

	if err != nil {
		log.Fatalf("failed to login: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to login")
	}
	return c.JSON(http.StatusOK, "login successful")
}

func (router *HttpRouter) Logout(c echo.Context) error {
	return nil
}

type (
	CreateInvitationRequest struct {
		Email    string `json:"email"`
		UserRole string `json:"user_role"`
	}

	LoginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
)
