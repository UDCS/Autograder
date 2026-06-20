package models

import "github.com/google/uuid"

type QuestionSubmissionGrade struct {
	SubmissionId  uuid.UUID `json:"submission_id"`
	StudentId     uuid.UUID `json:"student_id"`
	StudentName   string    `json:"student_name"`
	Score         int       `json:"score"`
	Code          string    `json:"code"`
	ConsoleOutput string    `json:"console_output"`
	IsManualGrade bool      `json:"is_manual_grade"`
	ManualGrade   int       `json:"manual_grade"`
}

type QuestionGradeResult struct {
	QuestionId   uuid.UUID                 `json:"question_id"`
	QuestionName string                    `json:"question_name"`
	MaxPoints    int                       `json:"max_points"`
	Submissions  []QuestionSubmissionGrade `json:"submissions"`
}

type AssignmentGradeResult struct {
	AssignmentId   uuid.UUID             `json:"assignment_id"`
	AssignmentName string                `json:"assignment_name"`
	Questions      []QuestionGradeResult `json:"questions"`
}

type ClassroomGradesResult struct {
	Assignments []AssignmentGradeResult `json:"assignments"`
}

type GradeUpdate struct {
	QuestionId    uuid.UUID `json:"question_id"`
	StudentId     uuid.UUID `json:"student_id"`
	IsManualGrade bool      `json:"manual_grade"`
	NewScore      int       `json:"new_score"`
}

type UpdateClassroomGradesRequest struct {
	Updates []GradeUpdate `json:"updates"`
}
