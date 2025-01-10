package token

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func GenerateRandomToken() (token string, err error) {
	b := make([]byte, 32)
	_, err = rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func GenerateRandomTokenAndHash() (token string, tokenHash string, err error) {
	token, err = GenerateRandomToken()
	if err != nil {
		return "", "", fmt.Errorf("error generating token: %v", err)
	}

	hash := sha256.Sum256([]byte(token))
	tokenHash = hex.EncodeToString(hash[:])

	return token, tokenHash, nil
}
