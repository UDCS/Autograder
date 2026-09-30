import { AddSubmission, AssignmentGrade, RegisterManualGradeUpdateListener, SaveManualGrade, StudentAverageGrade } from "../../models/grades";
import "../css/AssignmentsGrades.css"
import StudentGradePanel from "./StudentGradePanel";

interface StudentGradesProps {
    grades: StudentAverageGrade[];
    showGrades: boolean;
    classroomId: string;
    assignments: AssignmentGrade[];
    addSubmission: AddSubmission;
    saveManualGrade: SaveManualGrade;
    registerManualGradeUpdateListener: RegisterManualGradeUpdateListener;
}

function StudentGrades({ grades, showGrades, classroomId, assignments, addSubmission, saveManualGrade, registerManualGradeUpdateListener }: StudentGradesProps) {
    return (
        <div className="assignments-grades">
            {grades.map(student => (
                <StudentGradePanel
                    key={student.student_id}
                    studentId={student.student_id}
                    studentName={student.student_name}
                    averageGrade={student.average_grade}
                    showGrade={showGrades}
                    classroomId={classroomId}
                    assignments={assignments}
                    addSubmission={addSubmission}
                    saveManualGrade={saveManualGrade}
                    registerManualGradeUpdateListener={registerManualGradeUpdateListener}
                />
            ))}
        </div>
    );
}

export default StudentGrades;
