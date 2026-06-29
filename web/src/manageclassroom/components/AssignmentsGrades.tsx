import { AssignmentGrade, ClassroomGrades, QuestionSubmission } from "../../models/grades";
import "../css/AssignmentsGrades.css"
import AssignmentGradePanel from "./AssignmentGradePanel";

interface AssignmentsGradesProps {
    grades: ClassroomGrades;
    updateSubmission: (submissionId: string, changes: Partial<QuestionSubmission>) => void;
    classroomId: string;
    showGrades: boolean;
    addSubmission: (submissionId: string) => void;
}
function AssignmentsGrades({grades, updateSubmission, classroomId, addSubmission}: AssignmentsGradesProps) {
    const gradesToAssignmentGradePanel = () => {
        return grades.assignments.map((assignment: AssignmentGrade) => {
            return <AssignmentGradePanel assignmentGrade={assignment} updateSubmission={updateSubmission} classroomId={classroomId} addSubmission={addSubmission}/>
        });
    }
    return (
        <div className="assignments-grades">
            {...gradesToAssignmentGradePanel()}
        </div>
    );
}
export default AssignmentsGrades;
