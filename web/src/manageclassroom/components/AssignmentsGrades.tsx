import { AssignmentGrade, ClassroomGrades, QuestionSubmission } from "../../models/grades";
import "../css/AssignmentsGrades.css"
import AssignmentGradePanel from "./AssignmentGradePanel";

interface AssignmentsGradesProps {
    grades: ClassroomGrades;
    updateSubmission: (submissionId: string, changes: Partial<QuestionSubmission>) => void;
    classroomId: string;
    showGrades: boolean;
}
function AssignmentsGrades({grades, updateSubmission, classroomId}: AssignmentsGradesProps) {
    const gradesToAssignmentGradePanel = () => {
        return grades.assignments.map((assignment: AssignmentGrade) => {
            return <AssignmentGradePanel assignmentGrade={assignment} updateSubmission={updateSubmission} classroomId={classroomId}/>
        });
    }
    return (
        <div className="assignments-grades">
            {...gradesToAssignmentGradePanel()}
        </div>
    );
}
export default AssignmentsGrades;