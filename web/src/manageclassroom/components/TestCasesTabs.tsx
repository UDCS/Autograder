import { useEffect, useRef, useState } from "react";
import fetchWithAuth from '../../utils/fetcher';
import "../css/TestCasesTabs.css"
import clsx from "clsx";
import { Editor } from "@monaco-editor/react";
import { registerRacket } from "../../components/editor/racketLanguage";
import FontSizeInput from "../../components/font-size-input/FontSizeInput";
import BlueButton from "../../components/buttons/BlueButton";
import TestCasesEditor from "./TestCasesEditor";
import { Question } from "../../models/classroom";
import TestRunResults from "./TestRunResults";
import { TestCaseResults } from "../../models/testcases";

type TabSelection = "default_code" | "solution" | "test_cases";

function TestCasesTabs({question}: {question: Question}) {
    const [isTestRun, setTestRun] = useState(false);
    const [runStatus, setRunStatus] = useState<string>("idle"); // "running" | "passed" | "failed" | "partial" | "error"
    const [results, setResults] = useState<TestCaseResults[]>([]);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [selected, setSelected] = useState<TabSelection>("default_code");

    const [fontSize, setFontSize] = useState<number>();
    const handleDefaultCodeChange = (newDef?: string) => {
        question.default_code = newDef;
    }
    const handleSolutionCodeChange = (newSol?: string) => {
        question.solution_code = newSol;
    }

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    useEffect(() => () => stopPolling(), []);

    // Runs the solution against all testcases, or a single one if testcaseId is given.
    const runSolution = async (testcaseId?: string) => {
        stopPolling();
        setResults([]);
        setRunStatus("running");
        setTestRun(true);
        try {
            const res = await fetchWithAuth(`/api/grader/question/${question.id}/solution/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testcase_id: testcaseId ?? null,
                    solution_code: question.solution_code ?? "",
                }),
            });
            if (!res.ok) { setRunStatus("error"); return; }
            const { run_id } = await res.json();

            pollRef.current = setInterval(async () => {
                try {
                    const r = await fetchWithAuth(`/api/grader/solution/run/${run_id}`);
                    if (!r.ok) return;
                    const data = await r.json();
                    if (data.status !== "running") {
                        stopPolling();
                        setResults(data.results ?? []);
                        setRunStatus(data.status);
                    }
                } catch { /* ignore transient errors */ }
            }, 2500);
        } catch {
            setRunStatus("error");
        }
    };

    const closeResults = () => {
        stopPolling();
        setTestRun(false);
    };

    return (
        <div className="testcases-tabs">
            <div className="tabs">
                <div className={clsx("tab", selected == "default_code" && "selected")} onClick={() => setSelected("default_code")}>
                    Default Code
                </div>
                <div className={clsx("tab", selected == "solution" && "selected")} onClick={() => setSelected("solution")}>
                    Solution
                </div>
                <div className={clsx("tab", selected == "test_cases" && "selected")} onClick={() => setSelected("test_cases")}>
                    Test Cases
                </div>
                <div className="font-size">
                    <FontSizeInput defaultFontSize={fontSize} onChange={(newFontSize: number) => setFontSize(newFontSize)} />
                </div>
            </div>
            <div className="tabs-body">
                <div className={clsx(selected !== "default_code" && "hidden", "default-code", selected === "default_code" && "tab-body")}>
                    <div className="tabs-editor">
                        <Editor key={question.prog_lang} beforeMount={registerRacket} defaultLanguage={question.prog_lang!} options={{fontSize: fontSize}} value={question.default_code} onChange={handleDefaultCodeChange} />
                    </div>
                </div>
                <div className={clsx(selected !== "solution" && "hidden","solution", selected === "solution" && "tab-body")}>
                    <div className="tabs-editor">
                        <Editor key={question.prog_lang} beforeMount={registerRacket} defaultLanguage={question.prog_lang!} options={{fontSize: fontSize}} value={question.solution_code} onChange={handleSolutionCodeChange} />
                    </div>
                    <BlueButton className="run-tests-button" onClick={() => runSolution()}>Run Tests on Solution</BlueButton>
                </div>
                <div className={clsx(selected !== "test_cases" && "hidden", "test-cases", selected === "test_cases" && "tab-body")}>
                    <TestCasesEditor question={question} fontSize={fontSize} runSolution={runSolution} />
                </div>
            </div>
            {isTestRun &&
                <TestRunResults
                    loading={runStatus === "running"}
                    error={runStatus === "error"}
                    testCasesResults={results}
                    close={closeResults}
                />}
        </div>
    );
}
export default TestCasesTabs;
