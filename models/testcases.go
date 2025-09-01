package models

import (
	"encoding/json"

	"github.com/google/uuid"
)

type TestcaseType string

const (
	Text TestcaseType = "text"
	Bash TestcaseType = "bash"
)

type TestcaseBody interface {
	GetType() TestcaseType
}

type TestcaseBodyWrapper struct {
	TestcaseBody
}

func (testcaseBody *TestcaseBodyWrapper) UnmarshalJSON(data []byte) error {
	var aux struct {
		Type TestcaseType `json:"type"`
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	switch aux.Type {
	case Text:
		var t TextTestcaseBody
		if err := json.Unmarshal(data, &t); err != nil {
			return err
		}
		testcaseBody.TestcaseBody = t
	default:
		var b BashTestcaseBody
		if err := json.Unmarshal(data, &b); err != nil {
			return err
		}
		testcaseBody.TestcaseBody = b
	}
	return nil
}

type TextTestcaseBody struct {
	TestcaseId uuid.UUID `json:"testcaseId" db:"testcase_id"`
	Inputs     string    `json:"inputs" db:"inputs"`
	Outputs    string    `json:"outputs" db:"outputs"`
	Hidden     bool      `json:"hidden" db:"hidden"`
}

func (b TextTestcaseBody) GetType() TestcaseType {
	return Text
}

type File struct {
	Id          uuid.UUID `json:"id" db:"id"`
	TestcaseId  uuid.UUID `json:"testcaseId" db:"testcase_id"`
	Name        string    `json:"name" db:"name"`
	Suffix      string    `json:"suffix" db:"suffix"`
	Body        string    `json:"body" db:"body"`
	PrimaryBash bool      `json:"primaryBash" db:"primary_bash"`
}

type BashTestcaseBody struct {
	PrimaryBashFile File   `json:"primaryBashFile"`
	OtherFiles      []File `json:"otherFiles"`
}

func (b BashTestcaseBody) GetType() TestcaseType {
	return Bash
}

type Testcase struct {
	Id                  uuid.UUID    `json:"id" db:"id"`
	Name                string       `json:"name" db:"name"`
	QuestionId          uuid.UUID    `json:"question_id" db:"question_id"`
	Type                TestcaseType `json:"type" db:"type"`
	TimeoutSeconds      uint64       `json:"timeoutSeconds" db:"timeout_seconds"`
	Points              uint64       `json:"points" db:"points"`
	TestcaseBodyWrapper `json:"body"`
}
