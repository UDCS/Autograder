import { AssignmentGrade, ClassroomGrades, QuestionGradesResponse, QuestionSubmission } from "../../models/grades";
import "../css/AssignmentsGrades.css"
import AssignmentGradePanel from "./AssignmentGradePanel";

interface AssignmentsGradesProps {
    grades: ClassroomGrades;
    updateSubmission: (submissionId: string | null, changes: Partial<QuestionSubmission>, studentId?: string) => void;
    classroomId: string;
    showGrades: boolean;
    addSubmission: (submissionId: string) => void;
    setQuestionGrades: (questionGrades: QuestionGradesResponse) => void;
}
function AssignmentsGrades({grades, updateSubmission, classroomId, addSubmission, setQuestionGrades}: AssignmentsGradesProps) {
    const gradesToAssignmentGradePanel = () => {
        return grades.assignments.map((assignment: AssignmentGrade) => {
            return <AssignmentGradePanel key={assignment.assignment_id} assignmentGrade={assignment} updateSubmission={updateSubmission} classroomId={classroomId} addSubmission={addSubmission} setQuestionGrades={setQuestionGrades}/>
        });
    }
    return (
        <div className="assignments-grades">
            {...gradesToAssignmentGradePanel()}
        </div>
    );
}
export default AssignmentsGrades;
