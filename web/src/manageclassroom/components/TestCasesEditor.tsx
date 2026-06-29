import { useEffect, useState } from "react";
import BlueButton from "../../components/buttons/BlueButton";
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import { TestCase, TextTestCaseBody } from "../../models/testcases";
import "../css/TestCasesEditor.css"
import TestCaseButton from "./TestCaseButton";
import TextTestCasePanel from "./TextTestCasePanel";
// import BashTestCasePanel from "./BashTestCasePanel"; // bash test cases are a later feature
import clsx from "clsx";
import NewTestCasePopup from "../../components/popup/NewTestCasePopup";
import { Question } from "../../models/classroom";
import CopyTestcasePopup from "../../components/popup/CopyTestcasePopup";
import DeleteTestcasePopup from "../../components/popup/DeleteTestcasePopup"
import { saveQuestions } from "../subpages/AssignmentsSubpage";
import { showToast } from "../../components/toast/toastBus";

function TestCasesEditor({question, fontSize: fS, runSolution}: {question: Question, fontSize?: number, runSolution: (testcaseId?: string) => void}) {

    if (!question.test_cases) {
        question.test_cases = [];
    }
    const testCasesList: TestCase[] = question.test_cases!;
    const [selectedTestCase, setSelectedTestCase] = useState<string>("");

    const [testcaseToModify, setTestcaseToModify] = useState<string>("");

    const [fontSize, setFontSize] = useState(fS);

    // popup states
    const [isCreatePopup, setCreatePopup] = useState<boolean>(false);
    const [isCopyPopup, setCopyPopup] = useState<boolean>(false);
    const [isDeletePopup, setDeletePopup] = useState<boolean>(false);

    // Bumped after generating to remount panels so the Output boxes re-read body.outputs.
    const [refreshKey, setRefreshKey] = useState(0);
    // id of the test case currently being generated (null when idle).
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    // Runs the solution against a test case's input and fills its expected Output box.
    const generateOutput = async (testcaseId: string) => {
        if (generatingId) return;
        const targets = testCasesList.filter(tc => tc.type === "text" && tc.id === testcaseId);
        if (targets.length === 0) return;

        // Confirm only when we'd overwrite existing (non-empty) expected output.
        const anyNonEmpty = targets.some(tc => (tc.body as TextTestCaseBody).outputs);
        if (anyNonEmpty && !window.confirm("This will overwrite the existing expected output. Continue?")) {
            return;
        }

        setGeneratingId(testcaseId);
        try {
            // Persist the latest solution code + test case inputs so the grader runs against them.
            await saveQuestions([question]);

            const res = await fetch(`/api/grader/question/${question.id}/solution/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ testcase_id: testcaseId, solution_code: question.solution_code ?? "" }),
            });
            if (!res.ok) throw new Error("failed to start run");
            const { run_id } = await res.json();

            // Poll until the run finishes.
            const results = await new Promise<any[]>((resolve, reject) => {
                const interval = setInterval(async () => {
                    try {
                        const r = await fetch(`/api/grader/solution/run/${run_id}`);
                        if (!r.ok) return;
                        const data = await r.json();
                        if (data.status !== "running") {
                            clearInterval(interval);
                            resolve(data.results ?? []);
                        }
                    } catch (err) {
                        clearInterval(interval);
                        reject(err);
                    }
                }, 2500);
            });

            // Fill each target test case's Output with the solution's stdout.
            for (const result of results) {
                const tc = testCasesList.find(t => t.id === result.testcase_id);
                if (tc) (tc.body as TextTestCaseBody).outputs = result.output ?? "";
            }

            // Auto-save the generated outputs, then remount so the boxes show them.
            await saveQuestions([question]);
            setRefreshKey(k => k + 1);
            showToast("Expected output generated", "success");
        } catch (err) {
            console.error("Failed to generate expected output:", err);
            showToast("Failed to generate expected output", "error");
        } finally {
            setGeneratingId(null);
        }
    };

    useEffect(() => {
        if (fS !== fontSize) setFontSize(fS);
        if (selectedTestCase === "" && testCasesList && testCasesList.length > 0) {
            setSelectedTestCase(testCasesList[0].id!);
        }
    }, [fS]);

    const testCasesToButtons = (tests: TestCase[]) => {
        if (!tests) return [];
        return tests.map(
            (testCase) => {
                return <TestCaseButton onDelete={() => {if (testCasesList.length > 1) {setTestcaseToModify(testCase.id); setDeletePopup(true);}}} onCopy={() => {setTestcaseToModify(testCase.id); setCopyPopup(true);}} testCaseInfo={testCase} setSelectedTestCase={setSelectedTestCase} selected={selectedTestCase === testCase.id} />
            }
        );
    }

    const testCasesToPanels = (tests: TestCase[]) => {
        if (!tests) return [];
        return tests.map(
            (testCase) => {
                if (testCase.type == "text") {
                    return (
                        <div key={`${testCase.id}-${refreshKey}`} className={clsx(selectedTestCase === testCase.id && "test-case-panel-parent", selectedTestCase !== testCase.id && "hidden")}>
                            <TextTestCasePanel testCaseInfo={testCase} runSolution={runSolution} generateOutput={generateOutput} busy={generatingId !== null} loading={generatingId === testCase.id} />
                        </div>
                    );
                }
                // Bash test cases are a later feature — only text test cases are rendered for now.
                // return (
                //     <div className={clsx(selectedTestCase === testCase.id && "test-case-panel-parent", selectedTestCase !== testCase.id && "hidden")}>
                //         <BashTestCasePanel testCaseInfo={testCase} fontSize={fontSize} />
                //     </div>
                // );
                return null;
            }
        );
    }

    return (
        <div className="testcases-editor">
            <div className="testcase-button-panel">
                <DarkBlueButton className="run-tests-button" onClick={() => runSolution()}>Run Tests on Solution</DarkBlueButton>
                <BlueButton className="new-test-case-button" onClick={() => setCreatePopup(true)}>+ Add Test Case</BlueButton>
                {...testCasesToButtons(testCasesList)}
            </div>
            <div className="testcase-editor-panel">
                {...testCasesToPanels(testCasesList)}
            </div>
            {isCreatePopup && <NewTestCasePopup testcaseList={testCasesList} onClose={() => setCreatePopup(false)} setSelect={setSelectedTestCase} />}
            {isCopyPopup && <CopyTestcasePopup question={question} toCopy={testCasesList.find((tc) => tc.id === testcaseToModify)!} onClose={() => setCopyPopup(false)} />}
            {isDeletePopup && <DeleteTestcasePopup changeSelected={setSelectedTestCase} question={question} onClose={() => setDeletePopup(false)} testcaseToDelete={testcaseToModify}/>}
        </div>
    );
}
export default TestCasesEditor;