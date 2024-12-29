package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (router *HttpRouter) CreateClassroom(c *gin.Context) {

	// TODO

	// newPost := &post{}
	// err := c.BindJSON(newPost)
	// if err != nil {
	// 	logrus.Error("failed to bind in create post: %v", err)
	// 	c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
	// 		"message": err.Error(),
	// 	})
	// 	return
	// }

	// // TODO: should set post.owner from auth
	// err = router.app.CreatePost(c, newPost.Content, "noodle")
	// if err != nil {
	// 	logrus.Error("failed to create post: %v", err)
	// 	c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
	// 		"message": err.Error(),
	// 	})
	// 	return
	// }
	c.JSON(http.StatusAccepted, gin.H{
		"message": "created successfully",
	})
}
