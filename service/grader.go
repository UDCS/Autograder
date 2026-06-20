package service

import (
	"fmt"
	"time"

	"github.com/UDCS/Autograder/grader"
	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/jwt_token"
	"github.com/google/uuid"
)

func (app *GraderApp) GradeSubmission(jwksToken string, questionId uuid.UUID, targetUserId *uuid.UUID, code *string) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return fmt.Errorf("error retrieving user info")
	}

	gradeUserId := userInfo.Id
	if targetUserId != nil {
		if userInfo.UserRole != models.Admin && userInfo.UserRole != models.Instructor {
			return fmt.Errorf("only instructors and admins can grade another student's submission")
		}
		if userInfo.UserRole == models.Instructor {
			questionInfo, err := app.store.GetQuestionInfo(questionId)
			if err != nil {
				return fmt.Errorf("question not found")
			}
			assignmentInfo, err := app.store.GetAssignmentInfo(questionInfo.AssignmentId)
			if err != nil {
				return fmt.Errorf("assignment not found")
			}
			_, err = app.store.GetUserClassroomInfo(userInfo.Id, assignmentInfo.ClassroomId)
			if err != nil {
				return fmt.Errorf("instructor is not in this classroom")
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
			return fmt.Errorf("failed to save code before grading: %w", err)
		}
	}

	submissionId, err := app.store.GetSubmissionId(gradeUserId, questionId)
	if err != nil {
		return err
	}

	if targetUserId == nil && !app.store.UserOwnsSubmission(userInfo.Id, submissionId) {
		return fmt.Errorf("user does not have permission to grade submission")
	}

	asyncGrader := grader.GetGrader()

	go asyncGrader.GradeSubmission(submissionId)
	return nil
}
