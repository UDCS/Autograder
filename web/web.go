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

	distDirFS     = echo.MustSubFS(dist, "dist")
	distIndexHTML = echo.MustSubFS(indexHTML, "dist")
	distTestHTML  = echo.MustSubFS(testHTML, "dist/test")
	distLoginHTML = echo.MustSubFS(loginHTML, "dist/login")
)

// RegisterHandlers registers the web handlers to serve the frontend
func RegisterHandlers(e *echo.Echo) {
	e.FileFS("/", "index.html", distIndexHTML)
	e.FileFS("/test", "test.html", distTestHTML)
	e.FileFS("/login", "login.html", distLoginHTML)
	e.StaticFS("/", distDirFS)
}
