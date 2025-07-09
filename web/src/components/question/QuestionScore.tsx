import "./QuestionScore.css"

interface QuestionScoreProps {
    points: number | undefined;
    score: number | undefined;
}

function QuestionScore({points, score}: QuestionScoreProps) {
    var completionIndicatorSrc = "/public/svg/XMark.svg";
    var colorClass = "red";
    if (score !== undefined && points !== undefined) {
        if (score >= points) {
            completionIndicatorSrc = "/public/svg/CheckMark.svg";
            colorClass = "green";
        } else if (score < points && score > 0) {
            completionIndicatorSrc = "/public/svg/HalfFull.svg";
            colorClass = "yellow";
        }
    } else {
        points = 0;
        score = 0;
    }
    return <div className="questionScore">
        <div className={`score ${colorClass}`}>
            Score: {score}/{points}
        </div>
        <img className={`completionIndicator ${colorClass}`} src={completionIndicatorSrc} />
    </div>;
}

export default QuestionScore;