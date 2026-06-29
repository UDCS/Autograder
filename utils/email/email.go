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

// SendHTML sends an HTML email (so links can be rendered as clickable <a> tags).
func SendHTML(dest string, subject string, htmlBody string) error {
	email := os.Getenv("EMAIL")
	if email == "" {
		return errors.New("environment variable 'EMAIL' does not exist")
	}
	pass := os.Getenv("PASS")
	if pass == "" {
		return errors.New("environment variable 'PASS' does not exist")
	}
	auth := smtp.PlainAuth("", email, pass, "smtp.gmail.com")
	headers := "To: " + dest + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n" +
		"\r\n"
	return smtp.SendMail("smtp.gmail.com:587", auth, email, []string{dest}, []byte(headers+htmlBody))
}
