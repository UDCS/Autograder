package jwt_token

import (
	"fmt"
	"time"

	"github.com/UDCS/Autograder/utils/config"

	"github.com/UDCS/Autograder/models"
	"github.com/golang-jwt/jwt"
)

func CreateAccessTokenString(userEmail string, userRole models.UserRole, expirationDuration time.Duration, JWTSecret string) (tokenString string, tokenExpirationTime time.Time, err error) {
	tokenExpirationTime = time.Now().Add(expirationDuration)

	claims := &models.AccessTokenClaims{
		StandardClaims: jwt.StandardClaims{
			Subject:   userEmail,
			ExpiresAt: tokenExpirationTime.Unix(),
		},
		Role: userRole,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err = token.SignedString([]byte(JWTSecret))

	return tokenString, tokenExpirationTime, err
}

func CreateRefreshTokenString(userEmail string, expirationDuration time.Duration, JWTSecret string) (tokenString string, tokenExpirationTime time.Time, err error) {
	tokenExpirationTime = time.Now().Add(expirationDuration)

	claims := &jwt.StandardClaims{
		Subject:   userEmail,
		ExpiresAt: tokenExpirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err = token.SignedString([]byte(JWTSecret))

	return tokenString, tokenExpirationTime, err
}

func CreateJWTTokens(userEmail string, userRole models.UserRole, jwtConfig config.JWTDetails) (*models.JWTTokens, error) {
	accessToken, accessTokenExpiration, err := CreateAccessTokenString(userEmail, userRole, jwtConfig.AccessTokenDuration, jwtConfig.Secret)
	if err != nil {
		return nil, fmt.Errorf("could not generate access token string: %v", err)
	}

	refreshToken, refreshTokenExpiration, err := CreateRefreshTokenString(userEmail, jwtConfig.RefreshTokenDuration, jwtConfig.Secret)
	if err != nil {
		return nil, fmt.Errorf("could not generate refresh token string: %v", err)
	}

	tokenDetails := models.JWTTokens{
		AccessToken:  models.AccessToken{TokenString: accessToken, ExpiresAt: accessTokenExpiration},
		RefreshToken: models.RefreshToken{TokenString: refreshToken, ExpiresAt: refreshTokenExpiration},
	}

	return &tokenDetails, nil
}

func ParseAccessTokenString(tokenString string, JWTSecret string) (*models.AccessTokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &models.AccessTokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*models.AccessTokenClaims)
	if !ok {
		return nil, err
	}

	return claims, nil
}

func ParseRefreshTokenString(tokenString string, JWTSecret string) (*jwt.StandardClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*jwt.StandardClaims)
	if !ok {
		return nil, err
	}

	return claims, nil
}
