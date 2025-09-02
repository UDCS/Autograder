import {TestCaseResults } from "../../models/testcases";
import "../css/TestRunResults.css"
import PointsProgress from "./PointsProgress";
import TestCaseExpand from "./TestCaseExpand";

type TestRunResultsProps = {
    close: () => void;
    testCasesResults: TestCaseResults[];
}
function TestRunResults({close, testCasesResults}: TestRunResultsProps) {
    const maxTotalPoints = () => {
        const points = testCasesResults.map((test) => test.maxPoints);
        var sum: number = 0
        for (let point of points) {
            sum += point;
        }
        return sum;
    }
    const totalEarnedPoints = () => {
        const points = testCasesResults.map((test) => test.points);
        var sum: number = 0
        for (let point of points) {
            sum += point;
        }
        return sum;
    }
    const getTestCaseExpands = () => 
        testCasesResults.map((testCase) => {
            return <TestCaseExpand testCaseResults={testCase}/>
        });
    return (
        <div className="test-run-results">
            <div className="dark-bg" onClick={close}/>
            <div className="run-results-panel">
                <div className="results-top">
                    <div className="results-title">
                        Test Run Results
                    </div>
                    <div className="results-exit-parent">
                        <button className="results-exit-button" onClick={close}></button>
                    </div>
                </div>
                <PointsProgress maxPoints={maxTotalPoints()} points={totalEarnedPoints()}/>
                <div>
                    {...getTestCaseExpands()}
                </div>
            </div>
        </div>
    )
}
export default TestRunResults;