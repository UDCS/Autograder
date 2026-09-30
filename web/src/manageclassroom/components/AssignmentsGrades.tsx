import { AddSubmission, AssignmentGrade, ClassroomGrades, QuestionGradesResponse, QuestionSubmission, SaveManualGrade } from "../../models/grades";
import "../css/AssignmentsGrades.css"
import AssignmentGradePanel from "./AssignmentGradePanel";

interface AssignmentsGradesProps {
    grades: ClassroomGrades;
    updateSubmission: (submissionId: string | null, changes: Partial<QuestionSubmission>, studentId?: string) => void;
    classroomId: string;
    showGrades: boolean;
    addSubmission: AddSubmission;
    setQuestionGrades: (questionGrades: QuestionGradesResponse) => void;
    saveManualGrade: SaveManualGrade;
}
function AssignmentsGrades({grades, updateSubmission, classroomId, addSubmission, setQuestionGrades, saveManualGrade}: AssignmentsGradesProps) {
    const gradesToAssignmentGradePanel = () => {
        return grades.assignments.map((assignment: AssignmentGrade) => {
            return <AssignmentGradePanel key={assignment.assignment_id} assignmentGrade={assignment} updateSubmission={updateSubmission} classroomId={classroomId} addSubmission={addSubmission} setQuestionGrades={setQuestionGrades} saveManualGrade={saveManualGrade}/>
        });
    }
    return (
        <div className="assignments-grades">
            {...gradesToAssignmentGradePanel()}
        </div>
    );
}
export default AssignmentsGrades;
