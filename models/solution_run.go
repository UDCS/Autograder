package models

import (
	"encoding/json"

	"github.com/google/uuid"
)

// SolutionTestRun is an instructor running the question's solution code against
// its testcases. It is distinct from a student submission and never touches
// student grades. The grader writes `status` and `results` (a JSON array of
// per-testcase results) back to this row; the frontend polls for them.
type SolutionTestRun struct {
	Id         uuid.UUID        `json:"id" db:"id"`
	QuestionId uuid.UUID        `json:"question_id" db:"question_id"`
	Status     SubmissionStatus `json:"status" db:"status"`
	Results    json.RawMessage  `json:"results" db:"results"`
}

// SolutionTestRunResult is the polling response: current status plus the
// per-testcase results once finished.
type SolutionTestRunResult struct {
	Status  SubmissionStatus `json:"status"`
	Results json.RawMessage  `json:"results"`
}
