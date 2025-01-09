package jwt_token

import (
	"fmt"
	"net/http"
	"time"

	"github.com/UDCS/Autograder/models"
	"github.com/golang-jwt/jwt"
)

func CreateJWTToken(userEmail string, userRole models.UserRole, JWTSecret string) (*models.JWTTokenDetails, error) {
	tokenExpirationTime := time.Now().Add(120 * time.Minute)

	claims := &models.Claims{
		StandardClaims: jwt.StandardClaims{
			Subject:   userEmail,
			ExpiresAt: tokenExpirationTime.Unix(),
		},
		Role: userRole,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(JWTSecret)

	if err != nil {
		return nil, fmt.Errorf("could not generate token: %v", err)
	}

	tokenDetails := models.JWTTokenDetails{TokenString: tokenString, ExpiresAt: tokenExpirationTime}

	return &tokenDetails, nil
}

func ParseCookie(cookie http.Cookie, JWTSecret string) (*models.Claims, error) {
	if cookie.Expires.After(time.Now()) {
		return nil, fmt.Errorf("expired authentication credentials")
	}

	token, err := jwt.ParseWithClaims(cookie.Value, &models.Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*models.Claims)

	if !ok {
		return nil, err
	}

	return claims, nil
}
