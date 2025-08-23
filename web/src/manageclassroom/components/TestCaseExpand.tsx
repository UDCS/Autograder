import { HTMLAttributes, useState } from "react";
import "../css/TestCaseExpand.css"
import clsx from "clsx";
import { TestCaseResults } from "../../models/testcases";
import ConsoleOutput from "../../components/assignment/ConsoleOutput";

type TestCaseExpandProps = HTMLAttributes<HTMLDivElement> & 
{
    testCaseResults: TestCaseResults;
    consoleOutput?: string;
};
function TestCaseExpand({testCaseResults, className, ...props}: TestCaseExpandProps) {
    const [expanded, setExpanded] = useState(false);
    const {name, points, maxPoints, consoleOutput} = testCaseResults;
    const triangle = () => {
        return !expanded ? "▲" : "▼"; 
    }
    return (
        <div className={clsx("testcase-expand", className)} {...props}>
            <div className="testcase-expand-top" onClick={() => setExpanded(!expanded)}>
                <div className="testcase-expand-label">
                    {name}
                    <span className="testcase-expand-points">({points}/{maxPoints} Points)</span>
                </div>
                <div className="expand-triangle">
                    {triangle()}
                </div>
            </div>
            {expanded && <ConsoleOutput output={consoleOutput ?? ""}/>}
        </div>
    );
}
export default TestCaseExpand;