package handler

import (
	"net/http"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/json_response"
	"github.com/UDCS/Autograder/utils/logger"
	"github.com/UDCS/Autograder/utils/middlewares"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

func (router *HttpRouter) CreateClassroom(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)
	if err != nil {
		logger.Error("failed to parse cookie for `access_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	var request CreateClassroomRequest

	err = c.Bind(&request)
	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnprocessableEntity, json_response.NewError("failed to parse request body"))
	}

	if request.Name == "" {
		return c.JSON(http.StatusBadRequest, json_response.NewError("cannot create a classroom without a `name`"))
	}

	newClassroom := models.Classroom{
		Name:      request.Name,
		Id:        uuid.New(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	createdClassroom, err := router.app.CreateClassroom(tokenString, newClassroom)
	if err != nil {
		logger.Error("failed to create classroom", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, json_response.NewError("failed to create classroom"))
	}
	return c.JSON(http.StatusCreated, createdClassroom)
}

func (router *HttpRouter) EditClassroom(c echo.Context) error {

	tokenString, err := middlewares.GetAccessToken(c)

	if err != nil {
		logger.Error("could not find access token", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("could not find access token"))
	}

	var request models.EditClassroomRequest

	err = c.Bind(&request)

	request.RoomId = c.Param("roomId")

	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("failed to parse request body"))
	}

	if request.Name == "" {
		return c.JSON(http.StatusBadRequest, json_response.NewError("cannot edit a classroom without a `name`"))
	}

	err = router.app.EditClassroom(tokenString, request)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}
	return c.JSON(http.StatusAccepted, json_response.NewMessage("successfully edited classroom"))
}

func (router *HttpRouter) DeleteClassroom(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)

	if err != nil {
		logger.Error("could not find access token", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("could not find access token"))
	}

	var request models.DeleteClassroomRequest

	request.RoomId = c.Param("roomId")

	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("failed to parse request body"))
	}

	err = router.app.DeleteClassroom(tokenString, request)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}
	return c.JSON(http.StatusAccepted, json_response.NewMessage("successfully deleted classroom"))
}

type CreateClassroomRequest struct {
	Name string `json:"name"`
}
