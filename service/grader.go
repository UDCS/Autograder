package service

import (
	"fmt"

	"github.com/UDCS/Autograder/grader"
	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/jwt_token"
	"github.com/google/uuid"
)

func (app *GraderApp) GradeSubmission(jwksToken string, questionId uuid.UUID) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return fmt.Errorf("error retrieving user info")
	}

	submissionId, err := app.store.GetSubmissionId(userInfo.Id, questionId)
	if err != nil {
		return err
	}

	if userInfo.UserRole != models.Admin && userInfo.UserRole != models.Instructor && !app.store.UserOwnsSubmission(userInfo.Id, questionId) {
		return fmt.Errorf("user does not have permission to grade submission")
	}

	asyncGrader := grader.GetGrader()

	go asyncGrader.GradeSubmission(submissionId)
	return nil
}
