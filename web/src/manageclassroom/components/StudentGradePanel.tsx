import { AddSubmission, AssignmentGrade, RegisterManualGradeUpdateListener, SaveManualGrade } from "../../models/grades";
import ExpandPanel from "./ExpandPanel";
import StudentAssignmentGradePanel from "./StudentAssignmentGradePanel";

interface StudentGradePanelProps {
    studentId: string;
    studentName: string;
    averageGrade: number;
    showGrade: boolean;
    classroomId: string;
    assignments: AssignmentGrade[];
    addSubmission: AddSubmission;
    saveManualGrade: SaveManualGrade;
    registerManualGradeUpdateListener: RegisterManualGradeUpdateListener;
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
                    questions={assignment.questions}
                    studentId={props.studentId}
                    studentName={props.studentName}
                    showGrade={props.showGrade}
                    addSubmission={props.addSubmission}
                    saveManualGrade={props.saveManualGrade}
                    registerManualGradeUpdateListener={props.registerManualGradeUpdateListener}
                />
            ))}
        </ExpandPanel>
    );
}

export default StudentGradePanel;
