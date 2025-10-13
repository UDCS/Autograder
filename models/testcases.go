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
	TestcaseBody `json:"body"`
}

func (testcase *Testcase) UnmarshalJSON(data []byte) error {
	var aux struct {
		Id             uuid.UUID    `json:"id" db:"id"`
		Name           string       `json:"name" db:"name"`
		QuestionId     uuid.UUID    `json:"question_id" db:"question_id"`
		Type           TestcaseType `json:"type" db:"type"`
		TimeoutSeconds uint64       `json:"timeoutSeconds" db:"timeout_seconds"`
		Points         uint64       `json:"points" db:"points"`
	}
	err := json.Unmarshal(data, &aux)
	if err != nil {
		return err
	}

	testcase.Id = aux.Id
	testcase.Name = aux.Name
	testcase.QuestionId = aux.QuestionId
	testcase.Type = aux.Type
	testcase.TimeoutSeconds = aux.TimeoutSeconds
	testcase.Points = aux.Points

	var testcaseBody TestcaseBody
	switch aux.Type {
	case Text:
		var auxText struct {
			Body TextTestcaseBody `json:"body"`
		}
		if err = json.Unmarshal(data, &auxText); err != nil {
			return err
		}
		testcaseBody = auxText.Body
	default:
		var auxBash struct {
			Body BashTestcaseBody `json:"body"`
		}
		if err = json.Unmarshal(data, &auxBash); err != nil {
			return err
		}
		testcaseBody = auxBash.Body
	}
	testcase.TestcaseBody = testcaseBody

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
	Id             uuid.UUID    `json:"id" db:"id"`
	Name           string       `json:"name" db:"name"`
	QuestionId     uuid.UUID    `json:"question_id" db:"question_id"`
	Type           TestcaseType `json:"type" db:"type"`
	TimeoutSeconds uint64       `json:"timeoutSeconds" db:"timeout_seconds"`
	Points         uint64       `json:"points" db:"points"`
	TestcaseBodyWrapper
}

func createBlankTestcase(questionId uuid.UUID) Testcase {
	testcaseId := uuid.New()

	return Testcase{
		Id:             testcaseId,
		Name:           "Testcase 1",
		QuestionId:     questionId,
		Type:           Text,
		TimeoutSeconds: 5,
		Points:         10,
		TestcaseBodyWrapper: TestcaseBodyWrapper{
			TestcaseBody: TextTestcaseBody{
				TestcaseId: testcaseId,
				Inputs:     "",
				Outputs:    "",
				Hidden:     true,
			},
		},
	}
}

func (testcase *Testcase) Rectify(properQuestionId uuid.UUID) {
	testcase.QuestionId = properQuestionId

	switch testcase.Type {
	case Text:
		var textTestcaseBody TextTestcaseBody = testcase.TestcaseBody.(TextTestcaseBody)
		textTestcaseBody.TestcaseId = testcase.Id
		testcase.TestcaseBody = textTestcaseBody
	case Bash:
		var bashTestcaseBody BashTestcaseBody = testcase.TestcaseBody.(BashTestcaseBody)
		bashTestcaseBody.PrimaryBashFile.TestcaseId = testcase.Id
		for i := range bashTestcaseBody.OtherFiles {
			file := &bashTestcaseBody.OtherFiles[i]
			file.TestcaseId = testcase.Id
		}
		testcase.TestcaseBody = bashTestcaseBody
	}
}
