package password

import (
	"crypto/rand"
	"crypto/sha512"
	"encoding/hex"
	"errors"
	"regexp"
)

func Hash(password string, salt string) string {
	passwordBytes := []byte(password)
	passwordBytes = append(passwordBytes, []byte(salt)...)

	sha512Hasher := sha512.New()
	sha512Hasher.Write(passwordBytes)
	hashedPasswordBytes := sha512Hasher.Sum(nil)
	hashedPasswordHex := hex.EncodeToString(hashedPasswordBytes)

	return hashedPasswordHex
}

func GenerateRandomSalt(saltSize int) (string, error) {
	var salt = make([]byte, saltSize)
	_, err := rand.Read(salt[:])

	return string(salt), err
}

func CheckPassword(hashedPassword, currPassword string, salt string) bool {
	currPasswordHash := Hash(currPassword, salt)

	return hashedPassword == currPasswordHash
}

func CheckPasswordSecurity(password string) (string, error) {
	if len(password) < 8 {
		return "", errors.New("password must be at least 8 characters long")
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
