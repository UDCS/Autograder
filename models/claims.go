package models

import (
	"time"

	"github.com/golang-jwt/jwt"
)

type Claims struct {
	Role UserRole `json:"role"`
	jwt.StandardClaims
}

type JWTTokenDetails struct {
	TokenString string    `json:"token_string"`
	ExpiresAt   time.Time `json:"expires_at"`
}
