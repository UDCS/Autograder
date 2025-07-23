package email

import (
	"os"
	"strings"
	"fmt"
	"net/smtp"
)

var email string
var auth smtp.Auth

func Setup() error {
	str, err := os.ReadFile("email_info")
	if err != nil {
		return err
	}
	arr := strings.Split(str,"\n")
	email = arr[0]
	auth = smtp.PlainAuth("", email, arr[1], "smtp.gmail.com")
	return nil
}

func Send(dest string, msg string) error {
	fmt.Print("Called Send\n")
	return smtp.SendMail("smtp.gmail.com:587", auth, email, []string{dest}, []byte(msg))
}
