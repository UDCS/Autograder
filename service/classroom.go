package service

import (
	"errors"
	"fmt"
	"net/mail"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/jwt_token"
	"github.com/google/uuid"
)

func (app *GraderApp) CreateClassroom(jwksToken string, classroom models.Classroom) (*models.Classroom, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return nil, fmt.Errorf("invalid autorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)

	if err != nil {
		return nil, fmt.Errorf("user does not exist")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return nil, fmt.Errorf("unauthorized: only an admin or an instructor can create a classroom")
	}
	createdClassroom, err := app.store.CreateClassroom(classroom)
	if err != nil {
		return &classroom, err
	}
	err = app.store.MatchUserToClassroom(userInfo.Email, string(userInfo.UserRole), createdClassroom.Id)
	if err != nil {
		return createdClassroom, err
	}
	blankAssignment := models.CreateBlankAssignment(classroom.Id)
	if err = app.store.SetVerboseAssignment(blankAssignment); err != nil {
		return createdClassroom, err
	}
	return createdClassroom, err
}

func (app *GraderApp) MatchUserToClassroom(jwksToken string, userEmail string, userRole string, classroomId uuid.UUID) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)

	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return fmt.Errorf("unauthorized: only an admin or an instructor can add students to a classroom")
	}

	_, err = app.store.GetUserInfo(userEmail)
	if err == nil {
		_, err = app.store.GetClassroomInfo(classroomId)
		if err != nil {
			return err
		}
		err = app.store.MatchUserToClassroom(userEmail, userRole, classroomId)
		if err != nil {
			return err
		}
	} else {
		return errors.New("user does not exist")
	}

	return nil
}
func (app *GraderApp) EditClassroom(jwksToken string, request models.EditClassroomRequest) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)

	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return fmt.Errorf("unauthorized: only an admin or an instructor can edit a classroom")
	}

	user, err := app.store.GetUserClassroomInfo(userInfo.Id, request.RoomId)

	if err != nil && claims.Role != models.Admin {
		return fmt.Errorf("invalid change request")
	}

	if user.UserRole != models.Instructor && claims.Role != models.Admin {
		return fmt.Errorf("unauthorized: only an admin or an instructor can edit a classroom")
	}

	err = app.store.EditClassroom(request)

	if err != nil {
		return err
	}

	return nil
}

func (app *GraderApp) DeleteClassroom(jwksToken string, request models.DeleteClassroomRequest) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	if claims.Role != models.Admin && claims.Role != models.Instructor {
		return fmt.Errorf("unauthorized: only an admin or an instructor can delete a classroom")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)

	if err != nil {
		return fmt.Errorf("error - user does not exist")
	}

	user, err := app.store.GetUserClassroomInfo(userInfo.Id, request.RoomId)

	if err != nil && claims.Role != models.Admin {
		return fmt.Errorf("invalid change request")
	}

	if user.UserRole != models.Instructor && claims.Role != models.Admin {
		return fmt.Errorf("unauthorized: only an admin or an instructor can delete a classroom")
	}

	err = app.store.DeleteClassroom(request)

	if err != nil {
		return err
	}

	return nil
}

func (app *GraderApp) GetViewAssignments(jwksToken string, classroomId uuid.UUID) ([]models.Assignment, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return []models.Assignment{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return []models.Assignment{}, fmt.Errorf("error retrieving user info")
	}

	if userInfo.UserRole != models.Admin {
		_, err = app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return []models.Assignment{}, fmt.Errorf("user not in classroom")
		}
	}

	assignments, err := app.store.GetViewAssignments(userInfo.Id, classroomId)
	if err != nil {
		return []models.Assignment{}, err
	}
	return assignments, nil
}

func (app *GraderApp) GetVerboseAssignments(jwksToken string, classroomId uuid.UUID) ([]models.Assignment, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return []models.Assignment{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return []models.Assignment{}, fmt.Errorf("error retrieving user info")
	}

	if userInfo.UserRole != models.Admin {
		user, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return []models.Assignment{}, fmt.Errorf("user not in classroom")
		} else if user.UserRole != models.Instructor && user.UserRole != models.Assistant {
			return []models.Assignment{}, fmt.Errorf("user does not have the role to view verbose assignment")
		}
	}

	assignments, err := app.store.GetVerboseAssignments(userInfo.Id, classroomId)
	if err != nil {
		return []models.Assignment{}, err
	}
	return assignments, nil
}

func (app *GraderApp) GetClassroomStudents(jwksToken string, classroomId uuid.UUID) ([]models.UserInClassroom, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return []models.UserInClassroom{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return []models.UserInClassroom{}, fmt.Errorf("error retrieving user info")
	}

	if userInfo.UserRole != models.Admin {
		user, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return []models.UserInClassroom{}, fmt.Errorf("user not in classroom")
		} else if user.UserRole != models.Instructor && user.UserRole != models.Assistant {
			return []models.UserInClassroom{}, fmt.Errorf("user does not have the role get students of classroom")
		}
	}

	students, err := app.store.GetClassroomStudents(classroomId)

	if err != nil {
		return []models.UserInClassroom{}, err
	}

	newStudents := make([]models.UserInClassroom, len(students)-1)
	newStudentIndex := 0
	for _, student := range students {
		if student.Email != claims.Subject {
			newStudents[newStudentIndex] = student
			newStudentIndex++
		}
	}

	return newStudents, nil

}

func (app *GraderApp) EditClassroomStudents(jwksToken string, classroomId uuid.UUID, newUsers []models.UserInClassroom) ([]models.UserInClassroom, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return []models.UserInClassroom{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return []models.UserInClassroom{}, fmt.Errorf("error retrieving user info")
	}

	if userInfo.UserRole != models.Admin {
		user, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return []models.UserInClassroom{}, fmt.Errorf("user not in classroom")
		} else if user.UserRole != models.Instructor && user.UserRole != models.Assistant {
			return []models.UserInClassroom{}, fmt.Errorf("user does not have the role get students of classroom")
		}
	}

	newStudentList := make([]models.UserInClassroom, 0)
	for _, student := range newUsers {
		studentEmail := student.Email
		studentRole := student.UserRole
		user, err := app.store.GetUserInfo(studentEmail)
		userExists := err == nil
		if userExists {
			_ = app.store.MatchUserToClassroom(studentEmail, string(studentRole), classroomId)
			student.FirstName = user.FirstName
			student.LastName = user.LastName
			student.ClassroomId = classroomId
			student.State = models.Registered
			student.UserId = user.Id
		} else {
			parsedEmail, err := mail.ParseAddress(studentEmail)
			if err != nil {
				continue
			}
			studentEmail = parsedEmail.Address
			invitation, err := app.store.GetInvitationFromEmail(studentEmail)
			invitationExists := err == nil
			if !invitationExists {
				invitation = &models.Invitation{
					Id:          uuid.New(),
					Email:       studentEmail,
					UserRole:    studentRole,
					CreatedAt:   time.Now(),
					UpdatedAt:   time.Now(),
					ClassroomId: classroomId,
				}
				_, _ = app.CreateInvitation(jwksToken, *invitation)
				student.UserId = invitation.Id
			} else {
				err = app.store.MatchFutureUserToClassroom(studentEmail, classroomId, student.UserRole)
				student.UserId = invitation.Id
			}
			student.ClassroomId = classroomId
			student.State = models.Unregistered
		}
		newStudentList = append(newStudentList, student)
	}
	return newStudentList, nil

}

func (app *GraderApp) SetVerboseAssignments(jwksToken string, assignments []models.Assignment) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return fmt.Errorf("error retrieving user info")
	}

	// verifies the user's role for all the assignments
	for _, assignment := range assignments {
		classroomId := assignment.ClassroomId
		if userInfo.UserRole != models.Admin {
			user, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
			if err != nil {
				return fmt.Errorf("user not in classroom")
			} else if user.UserRole != models.Instructor && user.UserRole != models.Assistant {
				return fmt.Errorf("user does not have the role to edit verbose assignment")
			}
		}
	}
	// updates the assignments
	for _, assignment := range assignments {
		// if assignment.CreatedAt.IsZero() {
		// 	assignment.CreatedAt = time.Now()
		// }
		if err := app.store.SetVerboseAssignment(assignment); err != nil {
			return err
		}
	}
	return nil
}

func (app *GraderApp) SetVerboseQuestions(jwksToken string, questions []models.Question) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return fmt.Errorf("error retrieving user info")
	}
	// verifies the user's role for all the questions
	for i := range questions {

		question := &questions[i]
		questionInfo, err := app.store.GetQuestionInfo(question.Id)
		if err == nil && questionInfo.AssignmentId != question.AssignmentId {
			question.AssignmentId = questionInfo.AssignmentId
		}
		assignmentInfo, err := app.store.GetAssignmentInfo(question.AssignmentId)
		if err != nil {
			return err
		}
		classroomId := assignmentInfo.ClassroomId
		question.Rectify(question.AssignmentId)

		if userInfo.UserRole != models.Admin {
			user, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
			if err != nil {
				return fmt.Errorf("user not in classroom")
			} else if user.UserRole != models.Instructor && user.UserRole != models.Assistant {
				return fmt.Errorf("user does not have the role to edit verbose assignment")
			}
		}
	}
	// updates the questions
	for _, question := range questions {
		if err := app.store.SetVerboseQuestion(question); err != nil {
			return err
		}
	}
	return nil
}

func (app *GraderApp) DeleteAssignment(jwksToken string, assignmentId uuid.UUID) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return fmt.Errorf("error retrieving user info")
	}
	assignmentInfo, err := app.store.GetAssignmentInfo(assignmentId)
	if err != nil {
		return fmt.Errorf("failed to get assignment info")
	}
	if userInfo.UserRole != models.Admin {
		classroomId := assignmentInfo.ClassroomId
		userInClassroom, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return fmt.Errorf("user not in classroom")
		}
		if userInClassroom.UserRole != models.Instructor {
			return fmt.Errorf("user does not have the role to delete assignment")
		}
	}

	if err = app.store.DeleteAssignment(assignmentId); err != nil {
		return fmt.Errorf("failed to delete assignment: %s", err.Error())
	}

	return nil
}

func (app *GraderApp) DeleteQuestion(jwksToken string, questionId uuid.UUID) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return fmt.Errorf("error retrieving user info")
	}
	questionInfo, err := app.store.GetQuestionInfo(questionId)
	if err != nil {
		return fmt.Errorf("failed to get question info")
	}
	assignmentInfo, err := app.store.GetAssignmentInfo(questionInfo.AssignmentId)
	if err != nil {
		return fmt.Errorf("failed to get assignment info")
	}
	if userInfo.UserRole != models.Admin {
		classroomId := assignmentInfo.ClassroomId
		userInClassroom, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return fmt.Errorf("user not in classroom")
		}
		if userInClassroom.UserRole != models.Instructor {
			return fmt.Errorf("user does not have the role to delete question")
		}
	}

	if err = app.store.DeleteQuestion(questionId); err != nil {
		return fmt.Errorf("failed to delete assignment: %s", err.Error())
	}

	return nil
}

func (app *GraderApp) DeleteTestcase(jwksToken string, testcaseId uuid.UUID) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return fmt.Errorf("error retrieving user info")
	}
	testcaseInfo, err := app.store.GetTestcaseInfo(testcaseId)
	if err != nil {
		return fmt.Errorf("error retrieving testcase info")
	}
	questionInfo, err := app.store.GetQuestionInfo(testcaseInfo.QuestionId)
	if err != nil {
		return fmt.Errorf("failed to get question info")
	}
	assignmentInfo, err := app.store.GetAssignmentInfo(questionInfo.AssignmentId)
	if err != nil {
		return fmt.Errorf("failed to get assignment info")
	}
	if userInfo.UserRole != models.Admin {
		classroomId := assignmentInfo.ClassroomId
		userInClassroom, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return fmt.Errorf("user not in classroom")
		}
		if userInClassroom.UserRole != models.Instructor {
			return fmt.Errorf("user does not have the role to delete testcase")
		}
	}

	if err = app.store.DeleteTestcase(testcaseId); err != nil {
		return fmt.Errorf("failed to delete testcase: %s", err.Error())
	}
	return nil
}

func (app *GraderApp) GetAssignment(jwksToken string, assignmentId uuid.UUID) (models.Assignment, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return models.Assignment{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return models.Assignment{}, fmt.Errorf("error retrieving user info")
	}

	assignment, err := app.store.GetAssignment(assignmentId, userInfo.Id)
	if err != nil {
		return models.Assignment{}, err
	}

	classroomId := assignment.ClassroomId

	if userInfo.UserRole != models.Admin {
		userClassroomInfo, err := app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return models.Assignment{}, fmt.Errorf("user not in classroom")
		}
		if assignment.AssignmentMode != models.View && userClassroomInfo.UserRole == models.Student {
			return models.Assignment{}, fmt.Errorf("user does not have permission to view assignment")
		}
	}

	return assignment, nil
}

func (app *GraderApp) GetClassroom(jwksToken string, classroomId uuid.UUID) (models.Classroom, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)

	if err != nil {
		return models.Classroom{}, fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return models.Classroom{}, fmt.Errorf("invalid authorization credentials")
	}

	if userInfo.UserRole != models.Admin {
		_, err = app.store.GetUserClassroomInfo(userInfo.Id, classroomId)
		if err != nil {
			return models.Classroom{}, fmt.Errorf("user not in classroom")
		}
	}

	classroom, err := app.store.GetClassroomInfo(classroomId)
	if err != nil {
		return models.Classroom{}, err
	}

	return classroom, nil
}

func (app *GraderApp) UpdateSubmissionCode(jwksToken string, request models.UpdateSubmissionRequest) error {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)

	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	userInfo, err := app.store.GetUserInfo(claims.Subject)
	if err != nil {
		return fmt.Errorf("invalid authorization credentials")
	}

	request.UserId = userInfo.Id
	request.Id = uuid.New()
	request.UpdatedAt = time.Now()

	err = app.store.UpdateSubmissionCode(request)
	if err != nil {
		return err
	}

	return nil
}

func (app *GraderApp) GetUserRole(jwksToken string, roomId uuid.UUID) (models.UserRole, error) {
	claims, err := jwt_token.ParseAccessTokenString(jwksToken, app.authConfig.JWT.Secret)
	if err != nil {
		return "", fmt.Errorf("invalid authorization credentials")
	}
	return app.store.GetUserRole(claims.Subject, roomId)
}
