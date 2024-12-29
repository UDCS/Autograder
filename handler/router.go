package handler

import (
	"context"

	"github.com/UDCS/Autograder/service"
	"github.com/gin-gonic/gin"
)

type Handler interface {
	CreateClassroom(c context.Context, name string) error
}

type HttpRouter struct {
	engine *gin.Engine
	app    service.App
}

func New(appLayer service.App) *HttpRouter {
	router := &HttpRouter{
		engine: gin.New(),
		app:    appLayer,
	}
	router.SetupRoutes()
	return router
}

func (router *HttpRouter) SetupRoutes() {
	router.engine.Use(gin.Recovery())
	api := router.engine.Group("/api")
	{
		classroom := api.Group("/classroom")
		{
			classroom.POST("", router.CreateClassroom)
		}
	}
}

func (router *HttpRouter) Engage() {
	router.engine.Run()
}
