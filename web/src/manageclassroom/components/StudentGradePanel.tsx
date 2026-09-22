import ExpandPanel from "./ExpandPanel";

interface StudentGradePanelProps {
    studentId: string;
    studentName: string;
    averageGrade: number;
    showGrade: boolean;
}

function StudentGradePanel(props: StudentGradePanelProps) {
    return (
        <ExpandPanel title={props.studentName} grade={props.showGrade ? props.averageGrade : undefined}>
            <></>
        </ExpandPanel>
    );
}

export default StudentGradePanel;
