package handler

import (
	"log"
	"net/http"
	"time"

	"github.com/UDCS/Autograder/entities"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (router *HttpRouter) CreateClassroom(c echo.Context) error {
	var newClassroom = &entities.Classroom{}
	err := c.Bind(&newClassroom)
	if err != nil {
		log.Fatalf("failed to parse request body to classroom: %v", err)
		return echo.NewHTTPError(http.StatusUnprocessableEntity, err)
	}

	if newClassroom.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "cannot create a classroom without a `name`")
	}

	id := uuid.New()

	newClassroom.ID = id
	newClassroom.CreatedAt = time.Now().Format(time.RFC3339)
	newClassroom.UpdatedAt = time.Now().Format(time.RFC3339)

	createdClassroom, err := router.app.CreateClassroom(*newClassroom)
	if err != nil {
		log.Fatalf("failed to create classroom: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusCreated, createdClassroom)
}
