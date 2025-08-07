import { useState } from "react";
import BlueButton from "../../components/buttons/BlueButton";
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import { TestCase } from "../../models/testcases";
import "../css/TestCasesEditor.css"
import TestCaseButton from "./TestCaseButton";
import TextTestCasePanel from "./TextTestCasePanel";
import BashTestCasePanel from "./BashTestCasePanel";
import clsx from "clsx";

function TestCasesEditor() {

    const [selectedTestCase, setSelectedTestCase] = useState<string>("fa1374dc-723c-11f0-9cbf-0a0027000010");
    
    var testCases: TestCase[] = [
        {
            id: "fa1374dc-723c-11f0-9cbf-0a0027000010",
            name: "Test case 1",
            timeoutSeconds: 10,
            type: "text",
            points: 15,
            body: {
                testCases: [
                    {
                        inputs: "123",
                        outputs: "456",
                        hidden: true,
                    },
                    {
                        inputs: "456\n789",
                        outputs: "123\n456",
                        hidden: false,
                    }
                ]
            }
        },
        {
            id: "d95841bd-723d-11f0-b933-0a0027000010",
            name: "Test case 2",
            timeoutSeconds: 15,
            type: "text",
            points: 20,
            body: {
                testCases: [
                    {
                        inputs: "789",
                        outputs: "246",
                        hidden: false,
                    }
                ]
            }
        },
        {
            id: "10d457c8-725e-11f0-952e-0a0027000010",
            name: "Test case 3",
            timeoutSeconds: 20,
            type: "bash",
            points: 10,
            body: {
                primaryBashFile: {
                    name: "main",
                    body: "echo Hello, World!",
                    suffix: "sh"
                }
            }
        }
    ];

    const testCasesToButtons = (tests: TestCase[]) => {
        if (!tests) return [];
        return tests.map(
            (testCase) => {
                return <TestCaseButton testCaseInfo={testCase} setSelectedTestCase={setSelectedTestCase} selected={selectedTestCase === testCase.id} />
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
                        <BashTestCasePanel />
                    </div>
                );
            }
        );
    }

    return (
        <div className="testcases-editor">
            <div className="testcase-button-panel">
                <DarkBlueButton className="run-tests-button">Run Tests on Solution</DarkBlueButton>
                <BlueButton className="new-test-case-button">+ Add Test Case</BlueButton>
                {...testCasesToButtons(testCases)}
            </div>
            <div className="testcase-editor-panel">
                {...testCasesToPanels(testCases)}
            </div>
        </div>
    );
}
export default TestCasesEditor;