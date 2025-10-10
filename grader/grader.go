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

type CloudGrader struct{}

func (cg CloudGrader) GradeSubmission(submissionId uuid.UUID) {
	ctx := context.Background()

	c, err := run.NewJobsClient(ctx)
	logger.New()
	if err != nil {
		logger.Error(err.Error())
	}

	defer c.Close()

	projectID := "udcs-autograder"
	region := "us-south1"
	jobName := "grader-job"

	fullName := fmt.Sprintf("projects/%s/locations/%s/jobs/%s", projectID, region, jobName)

	req := &runpb.RunJobRequest{
		Name: fullName,
		Overrides: &runpb.RunJobRequest_Overrides{
			ContainerOverrides: []*runpb.RunJobRequest_Overrides_ContainerOverride{
				{
					Env: []*runpb.EnvVar{
						{Name: "SUBMISSION_ID", Values: &runpb.EnvVar_Value{Value: submissionId.String()}},
					},
				},
			},
		},
	}

	op, err := c.RunJob(ctx, req)
	if err != nil {
		logger.Error(err.Error())
	}

	_, err = op.Wait(ctx)
	if err != nil {
		logger.Error(err.Error())
	}

}

func GetGrader() Grader {
	return CloudGrader{}
}
