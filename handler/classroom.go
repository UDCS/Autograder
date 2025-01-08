package handler

import (
	"log"
	"net/http"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (router *HttpRouter) CreateClassroom(c echo.Context) error {
	var request = &CreateClassroomRequest{}
	err := c.Bind(&request)
	if err != nil {
		log.Fatalf("failed to parse request body: %v", err)
		return echo.NewHTTPError(http.StatusUnprocessableEntity, "failed to parse request body")
	}

	if request.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "cannot create a classroom without a `name`")
	}

	newClassroom := &models.Classroom{
		Name:      request.Name,
		ID:        uuid.New(),
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	createdClassroom, err := router.app.CreateClassroom(*newClassroom)
	if err != nil {
		log.Fatalf("failed to create classroom: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create classroom")
	}
	return c.JSON(http.StatusCreated, createdClassroom)
}

type CreateClassroomRequest struct {
	Name string `json:"name"`
}
