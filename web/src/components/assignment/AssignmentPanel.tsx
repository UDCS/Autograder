import { Assignment, Question } from "../../models/classroom";
import QuestionPanel from "../question/QuestionPanel";
import "./AssignmentPanel.css";


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
        <div className="assignmentDescription">{info.description}</div>
        {...questionsToPanel()}
    </div>
}
export default AssignmentPanel;