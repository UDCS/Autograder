package main

import (
	"github.com/UDCS/Autograder/handler"
	"github.com/UDCS/Autograder/repository"
	"github.com/UDCS/Autograder/service"
	"github.com/UDCS/Autograder/utils/config"
)

func main() {
	config := config.GetConfig()

	graderDatastore := repository.New(config.Db)
	graderService := service.New(graderDatastore, config.Auth)
	graderHandler := handler.New(graderService, config.Auth)

	graderHandler.SetupRoutes()
	graderHandler.Engage(config.Server.Port)
}
