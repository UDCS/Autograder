import "../css/AssignmentGradePanel.css"
import ExpandPanel from "./ExpandPanel";
import QuestionGradePanel from "./QuestionGradePanel";

interface AssignmentGradePanelProps {
    assignmentName: string;
} 

function AssignmentGradePanel({assignmentName}: AssignmentGradePanelProps) {
    return (
        <ExpandPanel title={assignmentName}>
            <QuestionGradePanel questionName="Nth number of fibonacci" />
        </ExpandPanel>
    );
}

export default AssignmentGradePanel;