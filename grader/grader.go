package grader

import (
	"context"
	"fmt"
	"os"
	"os/exec"

	run "cloud.google.com/go/run/apiv2"
	runpb "cloud.google.com/go/run/apiv2/runpb"
	"github.com/UDCS/Autograder/utils/logger"
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

type CloudGrader struct{}

const (
	cloudProjectID = "udcs-autograder"
	cloudRegion    = "us-south1"
	cloudJobName   = "grader-job"
)

// runJob launches the grader Cloud Run job with the given environment overrides
// (DB_DSN and other base config come from the job definition itself) and waits
// for it to finish. Errors are propagated so the caller can mark the run failed.
func (cg CloudGrader) runJob(envVars map[string]string) error {
	ctx := context.Background()

	c, err := run.NewJobsClient(ctx)
	if err != nil {
		logger.Error(err.Error())
		return err
	}
	defer c.Close()

	fullName := fmt.Sprintf("projects/%s/locations/%s/jobs/%s", cloudProjectID, cloudRegion, cloudJobName)

	env := make([]*runpb.EnvVar, 0, len(envVars))
	for name, value := range envVars {
		env = append(env, &runpb.EnvVar{Name: name, Values: &runpb.EnvVar_Value{Value: value}})
	}

	req := &runpb.RunJobRequest{
		Name: fullName,
		Overrides: &runpb.RunJobRequest_Overrides{
			ContainerOverrides: []*runpb.RunJobRequest_Overrides_ContainerOverride{
				{Env: env},
			},
		},
	}

	op, err := c.RunJob(ctx, req)
	if err != nil {
		logger.Error(err.Error())
		return err
	}

	if _, err = op.Wait(ctx); err != nil {
		logger.Error(err.Error())
		return err
	}

	return nil
}

func (cg CloudGrader) GradeSubmission(submissionId uuid.UUID) error {
	return cg.runJob(map[string]string{
		"SUBMISSION_ID": submissionId.String(),
	})
}

func (cg CloudGrader) RunSolution(runId uuid.UUID, questionId uuid.UUID, testcaseId *uuid.UUID) error {
	env := map[string]string{
		"RUN_MODE":    "solution",
		"RUN_ID":      runId.String(),
		"QUESTION_ID": questionId.String(),
	}
	if testcaseId != nil {
		env["TESTCASE_ID"] = testcaseId.String()
	}
	return cg.runJob(env)
}

func GetGrader() Grader {
	return CloudGrader{}
}
