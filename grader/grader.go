package grader

import (
	"fmt"
	"os"
	"os/exec"

	"github.com/google/uuid"
)

type Grader interface {
	GradeSubmission(submissionId uuid.UUID) error
	RunSolution(runId uuid.UUID, questionId uuid.UUID, testcaseId *uuid.UUID) error
}

type LocalGrader struct{}

func (lg LocalGrader) GradeSubmission(submissionId uuid.UUID) error {
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
	return cmd.Run()
}

func (lg LocalGrader) RunSolution(runId uuid.UUID, questionId uuid.UUID, testcaseId *uuid.UUID) error {
	dbString := os.Getenv("DOCKER_DBSTRING")
	args := []string{
		"run", "--rm",
		"--add-host=host.docker.internal:host-gateway",
		"-e", "RUN_MODE=solution",
		"-e", fmt.Sprintf("RUN_ID=%s", runId),
		"-e", fmt.Sprintf("QUESTION_ID=%s", questionId),
		"-e", fmt.Sprintf("DB_DSN=%s", dbString),
	}
	if testcaseId != nil {
		args = append(args, "-e", fmt.Sprintf("TESTCASE_ID=%s", *testcaseId))
	}
	args = append(args, "autograder-grader")

	cmd := exec.Command("docker", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func GetGrader() Grader {
	return LocalGrader{}
}
