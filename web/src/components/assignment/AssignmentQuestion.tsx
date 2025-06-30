import "./AssignmentQuestion.css"

type CompletionState = "none" | "partial" | "full";

interface AssignmentQuestionProps {
    completionState?: CompletionState;
    children: React.ReactNode;
}

function AssignmentQuestion({completionState="none", children}: AssignmentQuestionProps) {
    const stateImage = {
        "none": "/public/svg/XMark.svg",
        "partial": "/public/svg/HalfFull.svg",
        "full": "/public/svg/CheckMark.svg"
    };
    return (
        <div className="assignmentQuestion">
            <img className="completionIndicator" src={stateImage[completionState]}/>
            {children}
        </div>
    );
}
export default AssignmentQuestion;