package service

import (
	"fmt"
	"time"

	"github.com/UDCS/Autograder/grader"
	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/jwt_token"
	"github.com/google/uuid"
)

func (app *GraderApp) GradeSubmission(jwksToken string, questionId uuid.UUID, targetUserId *uuid.UUID, code *string) (uuid.UUID, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return uuid.Nil, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return uuid.Nil, fmt.Errorf("error retrieving user info")
	}

	gradeUserId := userInfo.Id
	if targetUserId != nil {
		if userInfo.UserRole != models.Admin && userInfo.UserRole != models.Instructor {
			return uuid.Nil, fmt.Errorf("only instructors and admins can grade another student's submission")
		}
		if userInfo.UserRole == models.Instructor {
			questionInfo, err := app.store.GetQuestionInfo(questionId)
			if err != nil {
				return uuid.Nil, fmt.Errorf("question not found")
			}
			assignmentInfo, err := app.store.GetAssignmentInfo(questionInfo.AssignmentId)
			if err != nil {
				return uuid.Nil, fmt.Errorf("assignment not found")
			}
			_, err = app.store.GetUserClassroomInfo(userInfo.Id, assignmentInfo.ClassroomId)
			if err != nil {
				return uuid.Nil, fmt.Errorf("instructor is not in this classroom")
			}
		}
		gradeUserId = *targetUserId
	}

	if code != nil {
		err = app.store.UpdateSubmissionCode(models.UpdateSubmissionRequest{
			Id:         uuid.New(),
			UserId:     gradeUserId,
			QuestionId: questionId,
			Code:       *code,
			UpdatedAt:  time.Now(),
		})
		if err != nil {
			return uuid.Nil, fmt.Errorf("failed to save code before grading: %w", err)
		}
	}

	submissionId, err := app.store.GetSubmissionId(gradeUserId, questionId)
	if err != nil {
		return uuid.Nil, err
	}

	if targetUserId == nil && !app.store.UserOwnsSubmission(userInfo.Id, submissionId) {
		return uuid.Nil, fmt.Errorf("user does not have permission to grade submission")
	}

	_ = app.store.SetSubmissionStatus(submissionId, models.SubmissionRunning)

	asyncGrader := grader.GetGrader()
	go func() {
		if err := asyncGrader.GradeSubmission(submissionId); err != nil {
			// Docker itself failed — the container didn't run so status is still 'running'; reset it
			_ = app.store.SetSubmissionStatus(submissionId, models.SubmissionFailed)
		}
	}()

	return submissionId, nil
}

// instructorAuthForQuestion verifies the user may act on a question: admins
// always may; otherwise the user must be an instructor or assistant in the
// question's classroom.
func (app *GraderApp) instructorAuthForQuestion(userInfo *models.User, questionId uuid.UUID) error {
	if userInfo.UserRole == models.Admin {
		return nil
	}
	questionInfo, err := app.store.GetQuestionInfo(questionId)
	if err != nil {
		return fmt.Errorf("question not found")
	}
	assignmentInfo, err := app.store.GetAssignmentInfo(questionInfo.AssignmentId)
	if err != nil {
		return fmt.Errorf("assignment not found")
	}
	user, err := app.store.GetUserClassroomInfo(userInfo.Id, assignmentInfo.ClassroomId)
	if err != nil {
		return fmt.Errorf("user not in classroom")
	}
	if user.UserRole != models.Instructor && user.UserRole != models.Assistant {
		return fmt.Errorf("user does not have permission")
	}
	return nil
}

// RunSolutionTests persists the latest solution code, creates a solution test
// run, and launches the grader in solution mode. If testcaseId is nil, all
// testcases run; otherwise just that one. Returns the run id to poll.
func (app *GraderApp) RunSolutionTests(jwksToken string, questionId uuid.UUID, testcaseId *uuid.UUID, solutionCode string) (uuid.UUID, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return uuid.Nil, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return uuid.Nil, fmt.Errorf("error retrieving user info")
	}

	if err := app.instructorAuthForQuestion(userInfo, questionId); err != nil {
		return uuid.Nil, err
	}

	if err := app.store.UpdateSolutionCode(questionId, solutionCode); err != nil {
		return uuid.Nil, fmt.Errorf("failed to save solution code: %w", err)
	}

	runId := uuid.New()
	if err := app.store.CreateSolutionTestRun(runId, questionId); err != nil {
		return uuid.Nil, err
	}

	asyncGrader := grader.GetGrader()
	go func() {
		if err := asyncGrader.RunSolution(runId, questionId, testcaseId); err != nil {
			// Docker itself failed — the container didn't run, so mark the run failed
			_ = app.store.SetSolutionTestRunStatus(runId, models.SubmissionFailed)
		}
	}()

	return runId, nil
}

// GetSolutionTestRun returns the current status and results of a solution run.
func (app *GraderApp) GetSolutionTestRun(jwksToken string, runId uuid.UUID) (models.SolutionTestRunResult, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return models.SolutionTestRunResult{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return models.SolutionTestRunResult{}, fmt.Errorf("error retrieving user info")
	}

	run, err := app.store.GetSolutionTestRun(runId)
	if err != nil {
		return models.SolutionTestRunResult{}, fmt.Errorf("solution test run not found")
	}

	if err := app.instructorAuthForQuestion(userInfo, run.QuestionId); err != nil {
		return models.SolutionTestRunResult{}, err
	}

	return models.SolutionTestRunResult{Status: run.Status, Results: run.Results}, nil
}
