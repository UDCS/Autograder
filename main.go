package main

import (
	"github.com/UDCS/Autograder/config"
	"github.com/UDCS/Autograder/handler"
	"github.com/UDCS/Autograder/repository"
	"github.com/UDCS/Autograder/service"
)

func main() {
	config := config.GetConfig()

	graderDatastore := repository.New(config.Db)
	graderService := service.New(graderDatastore)
	graderHandler := handler.New(graderService)

	graderHandler.SetupRoutes()
	graderHandler.Engage(config.Server.Port)
}
