package handler

import (
	"log"
	"net/http"
	"time"

	"github.com/UDCS/Autograder/entities"
	"github.com/fossoreslp/go-uuid-v4"
	"github.com/labstack/echo/v4"
)

func (router *HttpRouter) CreateClassroom(c echo.Context) error {
	var newClassroom = &entities.Classroom{}
	err := c.Bind(&newClassroom)
	if err != nil {
		log.Fatalf("failed to parse request body to classroom: %v", err)
		return echo.NewHTTPError(http.StatusUnprocessableEntity, err)
	}

	id, err := uuid.New()
	if err != nil {
		log.Fatalf("failed to generate UUID: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

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
