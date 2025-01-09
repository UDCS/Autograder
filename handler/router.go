package handler

import (
	"context"

	"github.com/UDCS/Autograder/service"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/UDCS/Autograder/web"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

type Handler interface {
	// Auth
	CreateInvitation(c context.Context) error
	SignUp(c context.Context) error
	Login(c context.Context) error
	Logout(c context.Context) error
	PasswordReset(c context.Context) error
	// Classroom
	CreateClassroom(c context.Context) error
}

type HttpRouter struct {
	engine     *echo.Echo
	app        service.App
	authConfig *config.Auth
}

func New(app service.App, authConfig *config.Auth) *HttpRouter {
	e := echo.New()
	// e.Pre(middleware.HTTPSRedirect()) // TODO: enable this when we have a valid SSL certificate

	e.Use(middleware.Secure())
	e.Use(middleware.CSRF())           // TODO: add CSRF token to the client
	e.Use(middleware.BodyLimit("10M")) // limiting request body size to 10MB
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(rate.Limit(10))))

	router := &HttpRouter{
		engine:     e,
		app:        app,
		authConfig: authConfig,
	}
	router.SetupRoutes()
	return router
}

func (router *HttpRouter) SetupRoutes() {
	api := router.engine.Group("/api")

	classroom := api.Group("/classroom")
	classroom.POST("", router.CreateClassroom)

	auth := api.Group("/auth")
	auth.POST("/invite", router.CreateInvitation)
	auth.POST("/register", router.SignUp)
	auth.POST("/login", router.Login)
	auth.POST("/logout", router.Logout)
}

func (router *HttpRouter) Engage(port string) {
	web.RegisterHandlers(router.engine)
	router.engine.Logger.Fatal(router.engine.Start(":" + port))
}
