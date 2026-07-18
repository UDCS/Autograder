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

	var body struct {
		UserId *uuid.UUID `json:"user_id"`
		Code   *string    `json:"code"`
	}
	_ = c.Bind(&body)

	submissionId, err := router.app.GradeSubmission(tokenString, questionId, body.UserId, body.Code)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"submission_id": submissionId,
	})
}

func (router *HttpRouter) RunSolutionTests(c echo.Context) error {
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

	var body struct {
		TestcaseId   *uuid.UUID `json:"testcase_id"`
		SolutionCode string     `json:"solution_code"`
	}
	_ = c.Bind(&body)

	runId, err := router.app.RunSolutionTests(tokenString, questionId, body.TestcaseId, body.SolutionCode)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"run_id": runId,
	})
}

func (router *HttpRouter) GetSolutionTestRun(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)
	if err != nil {
		logger.Error("failed to parse cookie for `access_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	runId, err := uuid.Parse(c.Param("run_id"))
	if err != nil {
		logger.Error("failed to parse run id")
		return c.JSON(http.StatusBadRequest, json_response.NewError("invalid run id"))
	}

	result, err := router.app.GetSolutionTestRun(tokenString, runId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	return c.JSON(http.StatusOK, result)
}

func (router *HttpRouter) GetSubmissionHistory(c echo.Context) error {
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

	studentId, err := uuid.Parse(c.QueryParam("student_id"))
	if err != nil {
		logger.Error("failed to parse student id")
		return c.JSON(http.StatusBadRequest, json_response.NewError("invalid student id"))
	}

	attempts, err := router.app.GetSubmissionHistory(tokenString, questionId, studentId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	return c.JSON(http.StatusOK, attempts)
}

func (router *HttpRouter) GetSubmissionStatuses(c echo.Context) error {
	tokenString, err := middlewares.GetAccessToken(c)
	if err != nil {
		logger.Error("failed to parse cookie for `access_token`", zap.Error(err))
		return c.JSON(http.StatusUnauthorized, json_response.NewError("unauthorized"))
	}

	var body struct {
		SubmissionIds []uuid.UUID `json:"submission_ids"`
	}
	if err = c.Bind(&body); err != nil || len(body.SubmissionIds) == 0 {
		return c.JSON(http.StatusBadRequest, json_response.NewError("invalid request body"))
	}

	results, err := router.app.GetSubmissionStatuses(tokenString, body.SubmissionIds)
	if err != nil {
		return c.JSON(http.StatusBadRequest, json_response.NewError(err.Error()))
	}

	return c.JSON(http.StatusOK, results)
}
