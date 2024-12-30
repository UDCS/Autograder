package main

import (
	"github.com/UDCS/Autograder/handler"
	"github.com/UDCS/Autograder/repository"
	"github.com/UDCS/Autograder/service"
	_ "github.com/lib/pq"
)

func main() {
	graderDatastore := repository.New()
	graderService := service.New(graderDatastore)
	graderHandler := handler.New(graderService)

	graderHandler.SetupRoutes()
	graderHandler.Engage()
}
