package starter

import (
	"fmt"
	"net/mail"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/service"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/UDCS/Autograder/utils/logger"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func Initialize(app service.App, config *config.Config) error {
	_, err := InviteAdmins(app, config.Auth.Admins)
	return err
}

func InviteAdmins(app service.App, adminEmails []string) ([]models.Invitation, error) {
	createdInvitations := make([]models.Invitation, 0)
	for _, email := range adminEmails {
		parsedEmail, err := mail.ParseAddress(email)
		if err != nil {
			return nil, fmt.Errorf("failed to parse email: %v", email)
		}

		invite := models.Invitation{
			Id:        uuid.New(),
			Email:     *parsedEmail,
			UserRole:  models.Admin,
			CreatedAt: time.Now().Format(time.RFC3339),
			UpdatedAt: time.Now().Format(time.RFC3339),
		}
		newInvitation, err := app.InviteAdmin(invite)
		if err != nil {
			logger.Error(fmt.Sprintf("failed to create invitation for email: %v", email), zap.Error(err))
			continue
		}
		createdInvitations = append(createdInvitations, *newInvitation)
	}
	return createdInvitations, nil
}
