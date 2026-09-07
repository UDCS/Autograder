package middlewares

import (
	"fmt"

	"github.com/labstack/echo/v4"
)

func ParseCookieForToken(c echo.Context, tokenName string) (tokenString string, err error) {
	cookie, err := c.Cookie(tokenName)

	if err != nil {
		return "", fmt.Errorf("could not find `%s` cookie: %v", tokenName, err)
	}

	return cookie.Value, nil
}

func GetAccessToken(c echo.Context) (string, error) {
	return ParseCookieForToken(c, "access_token")
}

func GetRefreshToken(c echo.Context) (string, error) {
	return ParseCookieForToken(c, "refresh_token")
}
