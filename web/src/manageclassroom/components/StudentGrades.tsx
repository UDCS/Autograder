import { StudentAverageGrade } from "../../models/grades";
import "../css/AssignmentsGrades.css"
import StudentGradePanel from "./StudentGradePanel";

interface StudentGradesProps {
    grades: StudentAverageGrade[];
    showGrades: boolean;
}

function StudentGrades({ grades, showGrades }: StudentGradesProps) {
    return (
        <div className="assignments-grades">
            {grades.map(student => (
                <StudentGradePanel
                    key={student.student_id}
                    studentId={student.student_id}
                    studentName={student.student_name}
                    averageGrade={student.average_grade}
                    showGrade={showGrades}
                />
            ))}
        </div>
    );
}

export default StudentGrades;
