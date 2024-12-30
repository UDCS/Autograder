package handler

import (
	"context"

	"github.com/UDCS/Autograder/service"
	"github.com/UDCS/Autograder/web"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Handler interface {
	CreateClassroom(c context.Context) error
}

type HttpRouter struct {
	engine *echo.Echo
	app    service.App
}

func New(app service.App) *HttpRouter {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	router := &HttpRouter{
		engine: e,
		app:    app,
	}
	router.SetupRoutes()
	return router
}

func (router *HttpRouter) SetupRoutes() {
	api := router.engine.Group("/api")

	classroom := api.Group("/classroom")
	classroom.POST("/create", router.CreateClassroom)
}

func (router *HttpRouter) Engage() {
	web.RegisterHandlers(router.engine)
	router.engine.Logger.Fatal(router.engine.Start(":8080")) // TODO: Get port from config
}
