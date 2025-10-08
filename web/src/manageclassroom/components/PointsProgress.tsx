import "../css/PointsProgress.css"

interface PointsProgressProps {
    maxPoints: number;
    points: number;
}
function PointsProgress({maxPoints, points}: PointsProgressProps) {
    return (
        <div className="points-progress-parent">
            <progress value={points} max={maxPoints} className="points-progress-bar"></progress>
            <div className="progress-text-parent">
                <div className="progress-text greentext">{points} Passed</div>
                <div className="progress-text redtext">{maxPoints - points} Failed</div>
                <div className="progress-text total-points">{points}/{maxPoints} Points</div>
            </div>
        </div>
    );
}   
export default PointsProgress;