import { useState } from "react";
import "../css/ExpandPanel.css"
import clsx from "clsx";

interface ExpandPanelProps {
    children: React.ReactNode;
    grade?: number;
    title: string;
    gap?: boolean;
}
function ExpandPanel({children, grade, title, gap=true}: ExpandPanelProps) {
    const [selected, setSelected] = useState(false);
    const triangle = () => {
        return selected ? "▲" : "▼"; 
    }
    const hasGrade = typeof grade !== "undefined";
    let gradeState;
    if (hasGrade) {
        if (grade >= 90) {
            gradeState = "exc-grade"
        } else if (grade >= 80) {
            gradeState = "good-grade"
        } else if (grade >= 70) {
            gradeState = "pass-grade"
        } else {
            gradeState = "poor-grade"
        }
    }
    return (
        <div className="expand-panel">
            <div className="expand-panel-header" onClick={() => setSelected(!selected)}>
                {hasGrade ? 
                    <>  
                        <span className="expand-panel-title center-title">{title}</span>
                        <div className="grade-triangle"> 
                            <div className={`header-grade ${gradeState}`}>{grade.toFixed(1)}%</div>
                            <div className="expand-button">{triangle()}</div>
                        </div>
                    </> 
                    : 
                    <>
                        <span className="expand-panel-title center-title">{title}</span>
                        <div className="grade-triangle">
                            <div className="expand-button">{triangle()}</div>
                        </div>
                    </>
                }
            </div>
            {selected &&
                <div className={clsx("expand-panel-body", gap && "with-gap")}>
                    {children}
                </div>
            }
        </div>
    );
}

export default ExpandPanel;