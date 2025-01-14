package main

import (
	"log"

	"github.com/UDCS/Autograder/handler"
	"github.com/UDCS/Autograder/repository"
	"github.com/UDCS/Autograder/service"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/UDCS/Autograder/utils/logger"
)

func main() {
	err := logger.New()
	if err != nil {
		log.Fatal(err)
	}

	config := config.GetConfig()

	graderDatastore := repository.New(config.Db)
	graderService := service.New(graderDatastore, config.Auth)
	graderHandler := handler.New(graderService)

	graderHandler.SetupRoutes()
	graderHandler.Engage(config.Server.Port)
}
