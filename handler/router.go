package handler

import (
	"context"

	"github.com/UDCS/Autograder/service"
	"github.com/UDCS/Autograder/web"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
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
	// e.Pre(middleware.HTTPSRedirect()) // TODO: enable this when we have a valid SSL certificate

	e.Use(middleware.Secure())
	e.Use(middleware.CSRF())           // TODO: add CSRF token to the client
	e.Use(middleware.BodyLimit("10M")) // limit request body size to 10MB
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(rate.Limit(10))))

	e.Use(echojwt.JWT([]byte("secret"))) // TODO: implement jwt in a different module and change secret to read from config

	router := &HttpRouter{
		engine: e,
		app:    app,
	}
	router.SetupRoutes()
	return router
}

func (router *HttpRouter) SetupRoutes() {
	api := router.engine.Group("/api")

	api.POST("/classroom", router.CreateClassroom)
}

func (router *HttpRouter) Engage(port string) {
	web.RegisterHandlers(router.engine)
	router.engine.Logger.Fatal(router.engine.Start(":" + port))
}
