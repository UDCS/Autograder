package handler

import (
	"log"
	"net/http"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/middlewares"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (router *HttpRouter) CreateClassroom(c echo.Context) error {
	tokenString, err := middlewares.ParseCookie(c)
	if err != nil {
		log.Fatalf("failed to parse cookie: %v", err)
		return c.JSON(401, echo.Map{"error": "unauthorized"})
	}

	var request CreateClassroomRequest

	err = c.Bind(&request)
	if err != nil {
		log.Fatalf("failed to parse request body: %v", err)
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
		log.Fatalf("failed to create classroom: %v", err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "failed to create classroom"})
	}
	return c.JSON(http.StatusCreated, createdClassroom)
}

type CreateClassroomRequest struct {
	Name string `json:"name"`
}
