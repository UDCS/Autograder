import { useEffect, useState } from "react";
import BlueButton from "../../components/buttons/BlueButton";
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import { TestCase } from "../../models/testcases";
import "../css/TestCasesEditor.css"
import TestCaseButton from "./TestCaseButton";
import TextTestCasePanel from "./TextTestCasePanel";
import BashTestCasePanel from "./BashTestCasePanel";
import clsx from "clsx";
import NewTestCasePopup from "../../components/popup/NewTestCasePopup";
import { Question } from "../../models/classroom";
import CopyTestcasePopup from "../../components/popup/CopyTestcasePopup";
import DeleteTestcasePopup from "../../components/popup/DeleteTestcasePopup"

function TestCasesEditor({question, fontSize: fS}: {question: Question, fontSize?: number}) {

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
                        <div className={clsx(selectedTestCase === testCase.id && "test-case-panel-parent", selectedTestCase !== testCase.id && "hidden")}>
                            <TextTestCasePanel testCaseInfo={testCase} />
                        </div>
                    );
                }
                return (
                    <div className={clsx(selectedTestCase === testCase.id && "test-case-panel-parent", selectedTestCase !== testCase.id && "hidden")}>
                        <BashTestCasePanel testCaseInfo={testCase} fontSize={fontSize} />
                    </div>
                );
            }
        );
    }

    return (
        <div className="testcases-editor">
            <div className="testcase-button-panel">
                <DarkBlueButton className="run-tests-button">Run Tests on Solution</DarkBlueButton>
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