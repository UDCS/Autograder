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
	IsValidLogin(c context.Context) error
	GetUserName(c context.Context) error
	// Classroom
	CreateClassroom(c context.Context) error
	EditClassroom(c context.Context) error
	DeleteClassroom(c context.Context) error
	ChangeUserInfo(c context.Context) error
	GetClassroom(c context.Context) error
	GetUserRole(c context.Context) error
	// Assignments
	GetViewAssignments(c context.Context) error
	GetVerboseAssignments(c echo.Context) error
	SetVerboseAssignments(c echo.Context) error
	SetVerboseQuestions(c echo.Context) error
	DeleteAssignment(c echo.Context) error
	DeleteQuestion(c echo.Context) error
	GetAssignment(c context.Context) error
	UpdateSubmissionCode(c context.Context) error
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
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(rate.Limit(20))))
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
	auth.POST("/logout", router.Logout)
	auth.POST("/password", router.PasswordResetRequest)
	auth.POST("/reset_password/:requestId", router.PasswordReset)
	auth.POST("/refresh", router.RefreshToken)
	auth.PUT("/:room_id/user", router.MatchUsersToClassroom)
	auth.PUT("/user_info", router.ChangeUserInfo)
	auth.GET("/valid_login", router.IsValidLogin)
	auth.GET("/user_name", router.GetUserName)

	classroom := api.Group("/classroom")
	classroom.GET("/all", router.GetClassroomsOfUser)
	classroom.POST("", router.CreateClassroom)
	classroom.GET("/:room_id", router.GetClassroom)
	classroom.PATCH("/edit/:room_id", router.EditClassroom)
	classroom.DELETE("/delete/:room_id", router.DeleteClassroom)
	classroom.GET("/:room_id/view_assignments", router.GetViewAssignments)
	classroom.GET("/:room_id/verbose_assignments", router.GetVerboseAssignments)
	classroom.POST("/:room_id/verbose_assignments", router.SetVerboseAssignments)
	classroom.DELETE("/assignment/:assignment_id", router.DeleteAssignment)
	classroom.DELETE("/question/:question_id", router.DeleteQuestion)
	classroom.GET("/assignment/:assignment_id", router.GetAssignment)
	classroom.POST("/question/:question_id/submission", router.UpdateSubmissionCode)
	classroom.POST("/verbose_questions", router.SetVerboseQuestions)
	classroom.GET("/role/:room_id", router.GetUserRole)
}

func (router *HttpRouter) Engage(port string) {
	web.RegisterHandlers(router.engine)
	router.engine.Logger.Fatal(router.engine.Start(":" + port))
}
