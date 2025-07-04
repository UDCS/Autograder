import "./QuestionScore.css"

interface QuestionScoreProps {
    points: number;
    score: number;
}

function QuestionScore({points, score}: QuestionScoreProps) {
    var completionIndicatorSrc = "/public/svg/CheckMark.svg";
    var colorClass = "green";
    if (score == 0) {
        completionIndicatorSrc = "/public/svg/XMark.svg";
        colorClass = "red";
    } else if (score < points) {
        completionIndicatorSrc = "/public/svg/HalfFull.svg";
        colorClass = "yellow";
    }
    return <div className="questionScore">
        <div className={`score ${colorClass}`}>
            Score: {score}/{points}
        </div>
        <img className={`completionIndicator ${colorClass}`} src={completionIndicatorSrc} />
    </div>;
}

export default QuestionScore;