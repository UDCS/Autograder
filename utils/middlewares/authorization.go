package middlewares

import (
	"fmt"

	"github.com/UDCS/Autograder/models"
	"github.com/UDCS/Autograder/utils/jwt_token"
	"github.com/labstack/echo/v4"
)

func IsAuthorized(c echo.Context, JWTSecret string) (*models.Claims, error) {
	cookie, err := c.Cookie("token")
	if err != nil {
		return nil, fmt.Errorf("could not find `token` cookie: %v", err)

	}

	claims, err := jwt_token.ParseCookie(*cookie, JWTSecret)
	return claims, err
}
