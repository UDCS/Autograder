package email

import (
	"os"
	"errors"
	"net/smtp"
)

func Send(dest string, msg string) error {
	email := os.Getenv("EMAIL")
	if email == ""{
		return errors.New("Environment variable 'EMAIL' does not exist")
	}
	pass := os.Getenv("PASS")
	if pass == ""{
		return errors.New("Environment variable 'PASS' does not exist")
	}
	auth := smtp.PlainAuth("", email, pass, "smtp.gmail.com")
	return smtp.SendMail("smtp.gmail.com:587", auth, email, []string{dest}, []byte(msg))
}
