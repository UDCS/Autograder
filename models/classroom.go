package models

import (
	"database/sql/driver"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

type DateOnly struct {
	time.Time
}

func (d DateOnly) Value() (driver.Value, error) {
	if d.IsZero() {
		return nil, nil
	}
	return d.Time.Format("2006-01-02"), nil // returns a string like "2024-05-23"
}

func (d *DateOnly) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), `"`)
	if s == "" {
		d.Time = time.Time{}
		return nil
	}
	parsed, err := time.Parse("2006-01-02", s)
	if err != nil {
		return err
	}
	d.Time = parsed
	return nil
}

func (d DateOnly) MarshalJSON() ([]byte, error) {
	return []byte(`"` + d.Time.Format("2006-01-02") + `"`), nil
}

func (d DateOnly) String() string {
	return d.Time.Format("2006-01-02")
}

func (d *DateOnly) Scan(value interface{}) error {
	switch v := value.(type) {
	case time.Time:
		d.Time = v
		return nil
	case []byte:
		t, err := time.Parse("2006-01-02", string(v))
		if err != nil {
			return err
		}
		d.Time = t
		return nil
	case string:
		t, err := time.Parse("2006-01-02", v)
		if err != nil {
			return err
		}
		d.Time = t
		return nil
	default:
		return fmt.Errorf("cannot scan type %T into DateOnly", value)
	}
}

func ParseDateOnly(value interface{}) (DateOnly, error) {
	var date DateOnly
	err := date.Scan(value)
	if err != nil {
		return DateOnly{}, err
	}
	return date, nil
}

type Classroom struct {
	Id                uuid.UUID `json:"id" db:"id"`
	Name              string    `json:"name" db:"name"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
	StartDate         DateOnly  `json:"start_date" db:"start_date"`
	EndDate           DateOnly  `json:"end_date" db:"end_date"`
	CourseCode        string    `json:"course_code" db:"course_code"`
	CourseDescription string    `json:"course_description" db:"course_description"`
	BannerImageIndex  uint16    `json:"banner_image_index" db:"banner_image_index"`
}

type UserInClassroom struct {
	User_id      uuid.UUID `json:"user_id" db:"user_id"`
	User_role    UserRole  `json:"user_role" db:"user_role"`
	Classroom_id uuid.UUID `json:"classroom_id" db:"classroom_id"`
}

type AddToClassRequest struct {
	User_email string `json:"email" db:"user_email"`
	User_role  string `json:"role" db:"user_role"`
}

type EditClassroomRequest struct {
	Name              string    `json:"name"`
	RoomId            uuid.UUID `json:"room_id"`
	StartDate         DateOnly  `json:"start_date" db:"start_date"`
	EndDate           DateOnly  `json:"end_date" db:"end_date"`
	CourseCode        string    `json:"course_code" db:"course_code"`
	CourseDescription string    `json:"course_description" db:"course_description"`
	BannerImageIndex  uint16    `json:"banner_image_index" db:"banner_image_index"`
}

type DeleteClassroomRequest struct {
	RoomId uuid.UUID `json:"classroom_id"`
}

type AssignmentMode string

const (
	Draft AssignmentMode = "draft"
	Edit  AssignmentMode = "edit"
	View  AssignmentMode = "view"
)

type Assignment struct {
	Id             uuid.UUID      `json:"id" db:"id"`
	ClassroomId    uuid.UUID      `json:"classroom_id" db:"classroom_id"`
	Name           string         `json:"name" db:"name"`
	Description    string         `json:"description" db:"description"`
	AssignmentMode AssignmentMode `json:"assignment_mode" db:"assignment_mode"`
	DueAt          time.Time      `json:"due_at" db:"due_at"`
	CreatedAt      time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at" db:"updated_at"`
}
