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
	RefreshToken(c context.Context) error
	// Classroom
	CreateClassroom(c context.Context) error
	EditClassroom(c context.Context) error
	DeleteClassroom(c context.Context) error
	ChangeUserData(c context.Context) error
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
	// e.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
	// 	TokenLookup: "header:X-CSRF-Token",
	// 	CookieName:  "csrf",
	// )))// TODO: add CSRF token to the client - https://github.com/labstack/echo/issues/582#issuecomment-310299266
	e.Use(middleware.BodyLimit("10M")) // limiting request body size to 10MB
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
	}))
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(rate.Limit(10))))
	e.Use(middleware.Gzip())

	router := &HttpRouter{
		engine: e,
		app:    app,
	}
	router.SetupRoutes()
	return router
}

func (router *HttpRouter) SetupRoutes() {
	api := router.engine.Group("/api")

	auth := api.Group("/auth")
	auth.POST("/invite", router.CreateInvitation)
	auth.POST("/register/:invitationId", router.SignUp)
	auth.POST("/login", router.Login)
	auth.POST("/logout/:sessionId", router.Logout)
	auth.POST("/password", router.PasswordResetRequest)
	auth.POST("/reset_password/:requestId", router.PasswordReset)
	auth.POST("/refresh", router.RefreshToken)
	auth.PUT("/:roomId/user", router.MatchUsersToClassroom)
	auth.GET("/get_classrooms", router.GetClassroomsOfUser)
	auth.POST("/change_user_data", router.ChangeUserData)

	classroom := api.Group("/classroom")
	classroom.POST("", router.CreateClassroom)
	classroom.PATCH("/edit/:roomId", router.EditClassroom)
	classroom.DELETE("/delete/:roomId", router.DeleteClassroom)
}

func (router *HttpRouter) Engage(port string) {
	web.RegisterHandlers(router.engine)
	router.engine.Logger.Fatal(router.engine.Start(":" + port))
}
