package password

import (
	"errors"
	"log"
	"regexp"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password []byte) (string, error) {
	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.MinCost)
	return string(hash), err
}

func ComparePasswords(hashedPassword string, plainPassword string) bool {
	byteHash := []byte(hashedPassword)
	bytePlain := []byte(plainPassword)
	err := bcrypt.CompareHashAndPassword(byteHash, bytePlain)
	if err != nil {
		log.Println(err)
		return false
	}

	return true
}

func CheckPasswordSecurity(password string) (string, error) {
	if len(password) < 8 || len(password) > 64 {
		return "", errors.New("password must be at 8-64 characters long")
	}

	var (
		hasUpper   = regexp.MustCompile(`[A-Z]`).MatchString(password)
		hasLower   = regexp.MustCompile(`[a-z]`).MatchString(password)
		hasNumber  = regexp.MustCompile(`[0-9]`).MatchString(password)
		hasSpecial = regexp.MustCompile(`[!@#~$%^&*()_+{}":;'?/>.<,]`).MatchString(password)
	)

	if !hasUpper || !hasLower || !hasNumber || !hasSpecial {
		return "", errors.New("password must include at least one uppercase letter, one lowercase letter, one number, and one special character")
	}

	return password, nil
}
