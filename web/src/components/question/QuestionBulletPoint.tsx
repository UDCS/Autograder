import "./QuestionBulletPoint.css"

export type CompletionState = "none" | "partial" | "full";

interface QuestionBulletPointProps {
    completionState?: CompletionState;
    children: React.ReactNode;
    assignmentId: string;
    questionId: string;
}

function QuestionBulletPoint({completionState="none", children, assignmentId, questionId}: QuestionBulletPointProps) {
    const stateImage = {
        "none": "/public/svg/XMark.svg",
        "partial": "/public/svg/HalfFull.svg",
        "full": "/public/svg/CheckMark.svg"
    };
    return (
        <a href={`/assignment?id=${assignmentId}#${questionId}`} className="assignmentQuestion">
            <img className="completionIndicator" src={stateImage[completionState]}/>
            {children}
        </a>
    );
}
export default QuestionBulletPoint;