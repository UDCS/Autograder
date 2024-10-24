package main

import (
	"net/http"

	"github.com/UDCS/Autograder/classroom"
	"github.com/UDCS/Autograder/web"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	web.RegisterHandlers(e)
	e.GET("/api", func(c echo.Context) error {
		return c.String(http.StatusOK, "This is coming in from an internal API!")
	})
	e.POST("/api/room/", classroom.MakeClassroom)
	e.Logger.Fatal(e.Start(":8080"))
}
