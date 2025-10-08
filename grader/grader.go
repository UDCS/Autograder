package grader

import (
	"fmt"
	"os"
	"os/exec"

	"github.com/google/uuid"
)

type Grader interface {
	GradeSubmission(submissionId uuid.UUID)
}

type LocalGrader struct{}

func (lg LocalGrader) GradeSubmission(submissionId uuid.UUID) {
	dbString := os.Getenv("DOCKER_DBSTRING")
	cmd := exec.Command(
		"docker", "run", "--rm",
		"--add-host=host.docker.internal:host-gateway",
		"-e", fmt.Sprintf("SUBMISSION_ID=%s", submissionId),
		"-e", fmt.Sprintf("DB_DSN=%s", dbString),
		"autograder-grader",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err := cmd.Run()
	if err != nil {
		fmt.Println(err.Error())
	}
}

func GetGrader() Grader {
	return LocalGrader{}
}
