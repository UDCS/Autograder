import "../css/QuestionGradePanel.css"

import ExpandPanel from "./ExpandPanel";
import QuestionGradeDropdown from "./QuestionGradeDropdown";

interface QuestionGradePanelProps {
    questionName: string;
} 

function QuestionGradePanel({questionName}: QuestionGradePanelProps) {
    return (
        <ExpandPanel title={questionName}>
            <QuestionGradeDropdown name="Student name 1" score={5} points={10} />
        </ExpandPanel>
    );
}

export default QuestionGradePanel;