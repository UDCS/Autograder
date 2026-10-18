package main

import (
	"log"
	"os"

	_ "time/tzdata" // embed the IANA tz database so time.LoadLocation works on all OSes (e.g. Windows)

	"github.com/UDCS/Autograder/handler"
	"github.com/UDCS/Autograder/repository"
	"github.com/UDCS/Autograder/service"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/UDCS/Autograder/utils/logger"
	"github.com/UDCS/Autograder/utils/starter"
)

// import (
// 	"github.com/labstack/echo/v4"
// )

func main() {
	err := logger.New()
	if err != nil {
		log.Fatal(err)
	}

	config := config.GetConfig()

	graderDatastore := repository.New(config.Db, config.App.TimeZone)
	graderService := service.New(graderDatastore, config.Auth)
	graderHandler := handler.New(graderService)

	err = starter.Initialize(graderService, config)
	if err != nil {
		log.Fatal(err)
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	graderHandler.Engage(port)
}
