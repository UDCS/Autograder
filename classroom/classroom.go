package classroom

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

type Classroom struct {
	ID         int
	Name       string `json:"name"`
	CreatedAt time.Time
}

var classrooms [1024]Classroom
var classIndex = 0

func (c Classroom) String() string {
	return fmt.Sprintf("{ID: %d, name: %v, created_at: %v}", c.ID, c.Name, c.CreatedAt.String())
}

func MakeClassroom(c echo.Context) error {
	classroom := Classroom{}
	if err := c.Bind(&classroom); err != nil {
		return err
	}

	classIndex++
	classroom.ID = classIndex
	classroom.CreatedAt = time.Now()
	classrooms[classIndex-1] = classroom
	//printClassrooms()
	return c.NoContent(http.StatusOK)
}
