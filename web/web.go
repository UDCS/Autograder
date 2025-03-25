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

	distDirFS     = echo.MustSubFS(dist, "dist")
	distIndexHTML = echo.MustSubFS(indexHTML, "dist")
	distTestHTML  = echo.MustSubFS(testHTML, "dist/test")
	distLoginHTML = echo.MustSubFS(loginHTML, "dist/login")
	distAboutHTML = echo.MustSubFS(aboutHTML, "dist/about")
	distFAQHTML   = echo.MustSubFS(FAQHTML, "dist/FAQ")
)

// RegisterHandlers registers the web handlers to serve the frontend
func RegisterHandlers(e *echo.Echo) {
	e.FileFS("/", "index.html", distIndexHTML)
	e.FileFS("/test", "test.html", distTestHTML)
	e.FileFS("/login", "login.html", distLoginHTML)
	e.FileFS("/about", "about.html", distAboutHTML)
	e.FileFS("/faq", "FAQ.html", distFAQHTML)
	e.StaticFS("/", distDirFS)
}
