import QuestionPanel from "../question/QuestionPanel";
import "./AssignmentPanel.css";
function AssignmentPanel() {
    return <div className="assignmentPanel">
        <div className="assignmentTitle">
            Assignment Title
        </div>
        <QuestionPanel />
    </div>
}
export default AssignmentPanel;