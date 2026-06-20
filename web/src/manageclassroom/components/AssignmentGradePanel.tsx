import { AssignmentGrade, QuestionGrade, QuestionSubmission } from "../../models/grades";
import "../css/AssignmentGradePanel.css"
import ExpandPanel from "./ExpandPanel";
import QuestionGradePanel from "./QuestionGradePanel";

interface AssignmentGradePanelProps {
    assignmentGrade: AssignmentGrade;
    updateSubmission: (submissionId: string, changes: Partial<QuestionSubmission>) => void;
    classroomId: string;
}

function AssignmentGradePanel({assignmentGrade, updateSubmission, classroomId}: AssignmentGradePanelProps) {

    const questionToPanels = () => {
        return assignmentGrade.questions.map((questionGrade: QuestionGrade) => {
            return <QuestionGradePanel questionGrade={questionGrade} updateSubmission={updateSubmission} classroomId={classroomId} />
        });
    };
    return (
        <ExpandPanel title={assignmentGrade.assignment_name}>
            {...questionToPanels()}
        </ExpandPanel>
    );
}

export default AssignmentGradePanel;