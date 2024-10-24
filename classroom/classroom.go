package classroom

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

// type for classrooms
type Classroom struct {
	ID         int
	Name       string `json:"name"`
	CreatedAt time.Time
}

// temporary array for storing classrooms
var classrooms [1024]Classroom
var classIndex = 0

// converts classroom to string format
func (c Classroom) String() string {
	return fmt.Sprintf("{ID: %d, name: %v, created_at: %v}", c.ID, c.Name, c.CreatedAt.String())
}

// prints all the classrooms
/*func printClassrooms() {
	fmt.Println("The classrooms:")
	for i := 0; i < classIndex; i++ {
		c := classrooms[i]
		fmt.Println(c)
	}
	fmt.Println()
}*/

// makes a new classroom
// only adds it to an array at this point until the database is set up
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
