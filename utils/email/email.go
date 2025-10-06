package email

import (
	"errors"
	"net/smtp"
	"os"
)

func Send(dest string, msg string) error {
	email := os.Getenv("EMAIL")
	if email == "" {
		return errors.New("environment variable 'EMAIL' does not exist")
	}
	pass := os.Getenv("PASS")
	if pass == "" {
		return errors.New("environment variable 'PASS' does not exist")
	}
	auth := smtp.PlainAuth("", email, pass, "smtp.gmail.com")
	return smtp.SendMail("smtp.gmail.com:587", auth, email, []string{dest}, []byte(msg))
}
