import { AddSubmission, AssignmentGrade, QuestionGrade, QuestionGradesResponse, QuestionSubmission, SaveManualGrade } from "../../models/grades";
import "../css/AssignmentGradePanel.css"
import ExpandPanel from "./ExpandPanel";
import QuestionGradePanel from "./QuestionGradePanel";

interface AssignmentGradePanelProps {
    assignmentGrade: AssignmentGrade;
    updateSubmission: (submissionId: string | null, changes: Partial<QuestionSubmission>, studentId?: string) => void;
    classroomId: string;
    addSubmission: AddSubmission;
    setQuestionGrades: (questionGrades: QuestionGradesResponse) => void;
    saveManualGrade: SaveManualGrade;
}

function AssignmentGradePanel({assignmentGrade, updateSubmission, classroomId, addSubmission, setQuestionGrades, saveManualGrade}: AssignmentGradePanelProps) {
    const questionToPanels = () => {
        return assignmentGrade.questions.map((questionGrade: QuestionGrade) => {
            return <QuestionGradePanel key={questionGrade.question_id} questionGrade={questionGrade} updateSubmission={updateSubmission} classroomId={classroomId} addSubmission={addSubmission} setQuestionGrades={setQuestionGrades} saveManualGrade={saveManualGrade} />
        });
    };
    return (
        <ExpandPanel title={assignmentGrade.assignment_name}>
            {...questionToPanels()}
        </ExpandPanel>
    );
}

export default AssignmentGradePanel;
