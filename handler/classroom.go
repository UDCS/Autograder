package handler

import (
	"fmt"
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
		Name:              request.Name,
		Id:                uuid.New(),
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
		StartDate:         request.StartDate,
		EndDate:           request.EndDate,
		CourseCode:        request.CourseCode,
		CourseDescription: request.CourseDescription,
		BannerImageIndex:  request.BannerImageIndex,
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

	if err != nil {
		logger.Error("failed to parse request body", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("failed to parse request body"))
	}

	request.RoomId, err = uuid.Parse(c.Param("room_id"))

	if err != nil {
		logger.Error("failed to parse room id", zap.Error(err))
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

	request.RoomId, err = uuid.Parse(c.Param("room_id"))

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

func (router *HttpRouter) GetViewAssignments(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)

	if err != nil {
		logger.Error("could not find access token", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("could not find access token"))
	}

	var classroomId uuid.UUID
	classroomId, err = uuid.Parse(c.Param("room_id"))
	if err != nil {
		logger.Error("could not parse classroom id", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	assignments, err := router.app.GetViewAssignments(tokenString, classroomId)
	if err != nil {
		logger.Error("could not get all assignments", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	return c.JSON(http.StatusOK, echo.Map{"assignments": assignments})
}

func (router *HttpRouter) GetAssignment(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)

	if err != nil {
		logger.Error("could not find access token", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("could not find access token"))
	}

	var assignmentId uuid.UUID
	assignmentId, err = uuid.Parse(c.Param("assignment_id"))
	if err != nil {
		logger.Error("could not parse assignment id", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	fmt.Println(assignmentId)

	assignment, err := router.app.GetAssignment(tokenString, assignmentId)
	if err != nil {
		logger.Error("could not get all assignments", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	return c.JSON(http.StatusOK, assignment)
}

func (router *HttpRouter) GetClassroom(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)

	if err != nil {
		logger.Error("failed to parse cookie for `access_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	classroomId, err := uuid.Parse(c.Param("room_id"))

	if err != nil {
		logger.Error("could not parse classroom id", zap.Error(err))
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	classroom, err := router.app.GetClassroom(tokenString, classroomId)

	if err != nil {
		logger.Error("could not find user", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError(err.Error()))
	}

	return c.JSON(http.StatusOK, classroom)
}

type CreateClassroomRequest struct {
	Name              string          `json:"name"`
	StartDate         models.DateOnly `json:"start_date"`
	EndDate           models.DateOnly `json:"end_date"`
	CourseCode        string          `json:"course_code"`
	CourseDescription string          `json:"course_description"`
	BannerImageIndex  uint16          `json:"banner_image_index"`
}
