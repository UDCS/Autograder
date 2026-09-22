import { AssignmentGrade } from "../../models/grades";
import ExpandPanel from "./ExpandPanel";
import StudentAssignmentGradePanel from "./StudentAssignmentGradePanel";

interface StudentGradePanelProps {
    studentId: string;
    studentName: string;
    averageGrade: number;
    showGrade: boolean;
    classroomId: string;
    assignments: AssignmentGrade[];
}

function StudentGradePanel(props: StudentGradePanelProps) {
    return (
        <ExpandPanel title={props.studentName} grade={props.showGrade ? props.averageGrade : undefined}>
            {props.assignments.map(assignment => (
                <StudentAssignmentGradePanel
                    key={assignment.assignment_id}
                    classroomId={props.classroomId}
                    assignmentId={assignment.assignment_id}
                    assignmentName={assignment.assignment_name}
                    studentId={props.studentId}
                    showGrade={props.showGrade}
                />
            ))}
        </ExpandPanel>
    );
}

export default StudentGradePanel;
