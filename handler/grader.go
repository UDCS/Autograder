package handler

import (
	"net/http"

	"github.com/UDCS/Autograder/utils/json_response"
	"github.com/UDCS/Autograder/utils/logger"
	"github.com/UDCS/Autograder/utils/middlewares"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"go.uber.org/zap"
)

func (router *HttpRouter) GradeSubmission(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)
	if err != nil {
		logger.Error("failed to parse cookie for `access_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	questionId, err := uuid.Parse(c.Param("question_id"))
	if err != nil {
		logger.Error("failed to parse question id")
		return c.JSON(http.StatusBadRequest, json_response.NewError("invalid question id"))
	}

	if err = router.app.GradeSubmission(tokenString, questionId); err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	return nil
}
