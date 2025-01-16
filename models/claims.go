package models

import (
	"time"

	"github.com/golang-jwt/jwt"
)

type (
	AccessTokenClaims struct {
		Role UserRole `json:"role"`
		jwt.StandardClaims
	}

	JWTTokens struct {
		AccessToken  AccessToken  `json:"access_token"`
		RefreshToken RefreshToken `json:"refresh_token"`
	}

	AccessToken struct {
		TokenString string    `json:"token_string"`
		ExpiresAt   time.Time `json:"expires_at"`
	}

	RefreshToken struct {
		TokenString string    `json:"token_string"`
		ExpiresAt   time.Time `json:"expires_at"`
	}
)
