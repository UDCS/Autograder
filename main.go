package main

import (
	"fmt"
	"net/http"
	"log"
	"os"

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

	graderDatastore := repository.New(config.Db)
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
