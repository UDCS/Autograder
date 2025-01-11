package handler

import (
	"context"

	"github.com/UDCS/Autograder/service"
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
	PasswordResetRequest(c context.Context) error
	// Classroom
	CreateClassroom(c context.Context) error
}

type HttpRouter struct {
	engine *echo.Echo
	app    service.App
}

func New(app service.App) *HttpRouter {
	e := echo.New()
	// e.AutoTLSManager.Cache = autocert.DirCache("/var/www/.cache") // TODO: figure out how to set HTTPS
	// e.Pre(middleware.HTTPSRedirect()) // TODO: enable this when HTTPS is set up

	e.Use(middleware.Secure())
	e.Use(middleware.CSRF())           // TODO: add CSRF token to the client - https://github.com/labstack/echo/issues/582#issuecomment-310299266
	e.Use(middleware.BodyLimit("10M")) // limiting request body size to 10MB
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS()) // TODO: restrict API access domain to local
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(rate.Limit(10))))

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
	classroom.POST("", router.CreateClassroom)

	auth := api.Group("/auth")
	auth.POST("/invite", router.CreateInvitation)
	auth.POST("/register/:invitationId", router.SignUp)
	auth.POST("/login", router.Login)
	auth.POST("/logout", router.Logout)
	auth.POST("/password", router.PasswordResetRequest)
	auth.POST("/reset_password/:resetId", router.PasswordReset)
}

func (router *HttpRouter) Engage(port string) {
	web.RegisterHandlers(router.engine)
	router.engine.Logger.Fatal(router.engine.Start(":" + port))
}
