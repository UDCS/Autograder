import { useState } from "react";
import QuestionScore from "../../components/question/QuestionScore";
import "../css/QuestionGradeDropdown.css"

interface QGDProps {
    name: string;
    score: number;
    points: number;
}
function QuestionGradeDropdown({name, score, points}: QGDProps) {
    const [selected, setSelected] = useState(false);
    const triangle = () => {
        return selected ? "▲" : "▼"; 
    }
    return (
        <div className="question-grade-dropdown">
            <div className="question-grade-header" onClick={() => setSelected(!selected)}>
                <div className="question-grade-title">
                    {name}
                </div>
                <div className="question-grade-button">
                    <QuestionScore score={score} points={points} numberOnly />
                    <div className="question-grade-triangle">
                        {triangle()}
                    </div>
                </div>
            </div>
            {selected && 
                <div className="question-grade-body">
                    This is the content yay
                </div>
            }
        </div>
    );
}

export default QuestionGradeDropdown;