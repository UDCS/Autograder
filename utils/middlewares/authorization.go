package middlewares

import (
	"fmt"
	"time"

	"github.com/labstack/echo/v4"
)

func ParseCookie(c echo.Context) (tokenString string, err error) {
	cookie, err := c.Cookie("token")

	if err != nil {
		return "", fmt.Errorf("could not find `token` cookie: %v", err)
	}

	if cookie.Expires.After(time.Now()) {
		return "", fmt.Errorf("expired authentication credentials")
	}

	return cookie.Value, nil
}
