import TitleInput from "../../components/title-input/TitleInput"
import "../css/QuestionEditor.css"
import "../css/AssignmentEditor.css"
import TextArea from "../../components/textarea/TextArea";
import TestCasesTabs from "./TestCasesTabs";

function QuestionEditor() {
    return (
        <div className="question-editor">
            <div className="title-parent">
                <TitleInput placeholder="Question Title" />
            </div>
            <div className="description">
                <div className="label">Question Description:</div>
                <TextArea placeholder="Question Description" rows={5} />
            </div>
            <TestCasesTabs />
            <div className="edit-buttons">
                <div className="button-parent">
                    <button className="edit-button save-button">
                        Save Question
                    </button>
                </div>
                <div className="button-parent right-align">
                    <button className="edit-button delete-button">
                        Delete Question
                    </button>
                </div>
            </div>
        </div>
    )
}
export default QuestionEditor;