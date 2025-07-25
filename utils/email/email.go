package email

import (
	"os"
	"strings"
	"net/smtp"
)

func Send(dest string, msg string) error {
	str, err := os.ReadFile("email_info")
	if err != nil {
		return err
	}
	arr := strings.Split(string(str),"\n")
	email := arr[0]
	pass := arr[1]
	auth := smtp.PlainAuth("", email, pass, "smtp.gmail.com")
	return smtp.SendMail("smtp.gmail.com:587", auth, email, []string{dest}, []byte(msg))
}
