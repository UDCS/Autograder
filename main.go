package main

import (
	"log"

	"github.com/UDCS/Autograder/handler"
	"github.com/UDCS/Autograder/repository"
	"github.com/UDCS/Autograder/service"
	"github.com/UDCS/Autograder/utils/config"
	"github.com/UDCS/Autograder/utils/logger"
	"github.com/UDCS/Autograder/utils/starter"
	"github.com/UDCS/Autograder/utils/email"
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

	err = starter.Initialize(graderService, config)
	if err != nil {
		log.Fatal(err)
	}

	graderHandler.SetupRoutes()
	graderHandler.Engage(config.Server.Port)

	err = email.Setup()
	if err != nil{
		panic(err)
	}
}
