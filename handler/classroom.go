package handler

import (
	"net/http"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/logger"
	"github.com/UDCS/Autograder/utils/middlewares"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

func (router *HttpRouter) CreateClassroom(c echo.Context) error {
	tokenString, err := middlewares.ParseCookie(c)
	if err != nil {
		logger.Error("failed to parse cookie", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, echo.Map{"error": "unauthorized"})
	}

	var request CreateClassroomRequest

	err = c.Bind(&request)
	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnprocessableEntity, echo.Map{"error": "failed to parse request body"})
	}

	if request.Name == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "cannot create a classroom without a `name`"})
	}

	newClassroom := models.Classroom{
		Name:      request.Name,
		Id:        uuid.New(),
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	createdClassroom, err := router.app.CreateClassroom(tokenString, newClassroom)
	if err != nil {
		logger.Error("failed to create classroom", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to create classroom"})
	}
	return c.JSON(http.StatusCreated, createdClassroom)
}

type CreateClassroomRequest struct {
	Name string `json:"name"`
}
