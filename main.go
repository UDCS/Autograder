package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/UDCS/Autograder/web"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
	_ "github.com/lib/pq"
)

var ConnString = MustGetEnv("DATABASE_URL")

func MustGetEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("FATAL: Environment variable %s is not set!", key)
	}
	return value
}

func main() {
	db := sqlx.MustConnect("postgres", ConnString)
	var version string
	err := db.QueryRow("select version()").Scan(&version)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(version)

	e := echo.New()

	web.RegisterHandlers(e)
	e.GET("/api", func(c echo.Context) error {
		return c.String(http.StatusOK, "This is coming in from an internal API!")
	})

	e.Logger.Fatal(e.Start(":8080"))
}
