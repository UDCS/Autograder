import QuestionPanel, { Question } from "../question/QuestionPanel";
import "./AssignmentPanel.css";

export interface Assignment {
    id?: string;
    classroom_id?: string;
    name?: string;
    description?: string;
    assignment_mode?: string;
    due_at?: Date;
    created_at?: Date;
    updated_at?: Date;
    sort_index?: number;
    questions?: Question[];
}

function AssignmentPanel({info}: {info: Assignment}) {
    const questionsToPanel = () => {
        if (info?.questions) {
            return info.questions?.map((question: Question) => {
                return <QuestionPanel info={question}/>
            });
        } 
        return [];
    }
    return <div className="assignmentPanel">
        <div className="assignmentTitle">
            {info.name}
        </div>
        {...questionsToPanel()}
    </div>
}
export default AssignmentPanel;