package classroom

import (
	"fmt"
	"time"

	"github.com/labstack/echo/v4"
)

type Classroom struct {
	ID         int
	Name       string
	Created_At time.Time
}

func MakeClassroom(c echo.Context) error {
	fmt.Print("Hello\n")
	return nil
}
