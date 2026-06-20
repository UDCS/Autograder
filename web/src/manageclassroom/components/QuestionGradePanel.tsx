import { QuestionGrade, QuestionSubmission } from "../../models/grades";
import "../css/QuestionGradePanel.css"

import ExpandPanel from "./ExpandPanel";
import QuestionGradeDropdown from "./QuestionGradeDropdown";

interface QuestionGradePanelProps {
    questionGrade: QuestionGrade;
    updateSubmission: (submissionId: string, changes: Partial<QuestionSubmission>) => void;
    classroomId: string;
}

function QuestionGradePanel({questionGrade, updateSubmission, classroomId}: QuestionGradePanelProps) {

    const questionSubmissionsToPanels = () => {
        return questionGrade.submissions.map((questionSubmission: QuestionSubmission) => {
            return <QuestionGradeDropdown questionSubmission={questionSubmission} max_score={questionGrade.max_points} updateSubmission={updateSubmission} classroomId={classroomId} questionId={questionGrade.question_id} />
        });
    }
    return (
        <ExpandPanel title={questionGrade.question_name}>
            {...questionSubmissionsToPanels()}
        </ExpandPanel>
    );
}

export default QuestionGradePanel;