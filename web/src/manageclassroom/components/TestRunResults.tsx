import {TestCaseResults } from "../../models/testcases";
import "../css/TestRunResults.css"
import PointsProgress from "./PointsProgress";
import TestCaseExpand from "./TestCaseExpand";
import Spinner from "../../components/spinner/Spinner";

type TestRunResultsProps = {
    close: () => void;
    loading: boolean;
    error?: boolean;
    testCasesResults: TestCaseResults[];
}
function TestRunResults({close, loading, error, testCasesResults}: TestRunResultsProps) {
    const maxTotalPoints = () => testCasesResults.reduce((sum, test) => sum + test.maxPoints, 0);
    const totalEarnedPoints = () => testCasesResults.reduce((sum, test) => sum + test.points, 0);
    const getTestCaseExpands = () =>
        testCasesResults.map((testCase) => <TestCaseExpand testCaseResults={testCase}/>);
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
                {loading ? (
                    <div className="run-results-loading">
                        <Spinner />
                        <div className="run-results-loading-text">Running tests…</div>
                    </div>
                ) : error ? (
                    <div className="run-results-error">An error occurred while running the tests.</div>
                ) : (
                    <>
                        <PointsProgress maxPoints={maxTotalPoints()} points={totalEarnedPoints()}/>
                        <div>
                            {...getTestCaseExpands()}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
export default TestRunResults;
