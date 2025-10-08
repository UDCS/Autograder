package web

import (
	"embed"

	"github.com/labstack/echo/v4"
)

var (
	//go:embed all:dist
	dist embed.FS
	//go:embed dist/index.html
	indexHTML embed.FS
	//go:embed dist/test/test.html
	testHTML embed.FS
	//go:embed dist/login/login.html
	loginHTML embed.FS
	//go:embed dist/about/about.html
	aboutHTML embed.FS
	//go:embed dist/FAQ/FAQ.html
	FAQHTML embed.FS
	//go:embed dist/resetpassword/resetpassword.html
	resetpasswordHTML embed.FS
	//go:embed dist/signup/signup.html
	signupHTML embed.FS
	//go:embed dist/dashboard/dashboard.html
	dashboardHTML embed.FS
	//go:embed dist/account/account.html
	accountHTML embed.FS
	//go:embed dist/classroom/classroom.html
	classroomHTML embed.FS
	//go:embed dist/manageclassroom/manageclassroom.html
	classroomManagerHTML embed.FS

	//go:embed dist/assignment/assignment.html
	assignmentHTML embed.FS

	//go:embed public
	publicDir embed.FS

	distDirFS                = echo.MustSubFS(dist, "dist")
	distIndexHTML            = echo.MustSubFS(indexHTML, "dist")
	distTestHTML             = echo.MustSubFS(testHTML, "dist/test")
	distLoginHTML            = echo.MustSubFS(loginHTML, "dist/login")
	distAboutHTML            = echo.MustSubFS(aboutHTML, "dist/about")
	distFAQHTML              = echo.MustSubFS(FAQHTML, "dist/FAQ")
	distResetpasswordHTML    = echo.MustSubFS(resetpasswordHTML, "dist/resetpassword")
	distSignupHTML           = echo.MustSubFS(signupHTML, "dist/signup")
	distAccountHTML          = echo.MustSubFS(accountHTML, "dist/account")
	distDashboardHTML        = echo.MustSubFS(dashboardHTML, "dist/dashboard")
	distClassroomHTML        = echo.MustSubFS(classroomHTML, "dist/classroom")
	distAssignmentHTML       = echo.MustSubFS(assignmentHTML, "dist/assignment")
	distClassroomManagerHTML = echo.MustSubFS(classroomManagerHTML, "dist/manageclassroom")

	distPublicDir = echo.MustSubFS(publicDir, "public")
)

// RegisterHandlers registers the web handlers to serve the frontend
func RegisterHandlers(e *echo.Echo) {
	e.FileFS("/", "index.html", distIndexHTML)
	e.FileFS("/test", "test.html", distTestHTML)
	e.FileFS("/login", "login.html", distLoginHTML)
	e.FileFS("/about", "about.html", distAboutHTML)
	e.FileFS("/faq", "FAQ.html", distFAQHTML)
	e.FileFS("/resetpassword", "resetpassword.html", distResetpasswordHTML)
	e.FileFS("/signup", "signup.html", distSignupHTML)
	e.FileFS("/dashboard", "dashboard.html", distDashboardHTML)
	e.FileFS("/account", "account.html", distAccountHTML)
	e.FileFS("/classroom", "classroom.html", distClassroomHTML)
	e.FileFS("/classroom/manage", "manageclassroom.html", distClassroomManagerHTML)
	e.FileFS("/assignment", "assignment.html", distAssignmentHTML)
	e.StaticFS("/public", distPublicDir)
	e.StaticFS("/", distDirFS)
}
