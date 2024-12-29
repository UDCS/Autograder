package main

import (
	"net/http"

	"github.com/UDCS/Autograder/datastore"
	"github.com/UDCS/Autograder/handler"
	"github.com/UDCS/Autograder/service"
	"github.com/UDCS/Autograder/web"
	"github.com/labstack/echo/v4"
	_ "github.com/lib/pq"
)

func main() {
	graderDatastore := datastore.New()
	graderService := service.New(graderDatastore)
	graderHandler := handler.New(graderService)

	graderHandler.SetupRoutes()
	graderHandler.Engage()

	// TODO: figure out how to embed the frontend into three layer architecture

	// embeding the frontend
	e := echo.New()

	web.RegisterHandlers(e)
	e.GET("/api", func(c echo.Context) error {
		return c.String(http.StatusOK, "This is coming in from an internal API!")
	})

	e.Logger.Fatal(e.Start(":8080"))
}
