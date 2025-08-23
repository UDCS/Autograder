import { useState } from "react";
import BlueButton from "../../components/buttons/BlueButton";
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import TextField, { TextFieldInput } from "../../components/textfield/Textfield";
import TitleInput from "../../components/title-input/TitleInput";
import { TestCase, TestCaseResults, TextInputOutput, TextTestCaseBody } from "../../models/testcases";
import "../css/TextTestCasePanel.css"
import TextTestCase from "./TextTestCase";
import TestRunResults from "./TestRunResults";

export type TestCasePanelProps = {
    testCaseInfo: TestCase;
}

const blankTestCase: TextInputOutput = {
    inputs: "",
    outputs: "",
    hidden: true,
}

const fakeTestCaseResults: TestCaseResults[] = [
    {name: "Test case 1", maxPoints: 20, points: 15, consoleOutput: "Your code is hot garbage. Consider switching majors"},
    {name: "Test case 2", maxPoints: 10, points: 10, consoleOutput: "You're not funny."}
]

function TextTestCasePanel({testCaseInfo}: TestCasePanelProps) {

    const body = testCaseInfo.body as TextTestCaseBody;

    const [testCases, setTestCases] = useState<TextInputOutput[]>(body.testCases!);

    const [isTestRun, setTestRun] = useState(false);

    const deleteTestCase = (indexToDelete: number) => {
        if (body.testCases!.length > 1) changeTestCases(testCases.filter((_, i) => i !== indexToDelete))
    }

    const changeTestCases = (newTestCases: TextInputOutput[]) => {
        body.testCases = newTestCases;
        setTestCases(newTestCases);
    }

    const textTestCaseComponents = () => {
        if (!testCases) return [];
        return testCases.map((testCase: TextInputOutput, index: number) => {
            return <TextTestCase onDelete={deleteTestCase} index={index} input_output={testCase} />
        });
    }

    const createNewTestCase = () => {
        changeTestCases(testCases.concat(blankTestCase))
    }

    const handleTitleChange = (newTitle: string) => {
        testCaseInfo.name = newTitle;
    }

    const handlePointsChange = ({value}: TextFieldInput) => {
        testCaseInfo.points = Number(value);
    }

    const handleTimeoutChange = ({value}: TextFieldInput) => {
        testCaseInfo.timeoutSeconds = Number(value);
    }

    return (
        <div className="test-case-panel">
            <div className="title-run-test">
                <div className="test-case-title-parent">
                    <TitleInput className="test-case-title" value={testCaseInfo.name} onChange={handleTitleChange} />
                </div>
                <div className="test-case-run-parent">
                    <DarkBlueButton className="run-test-button" onClick={() => setTestRun(true)}>Run Test on Solution</DarkBlueButton>
                </div>
            </div>
            <div className="points-timeout">
                <TextField className="test-case-textfield" value={testCaseInfo.points} type="number" label="Points" initialValue="Points for this test case" onChange={handlePointsChange}/>
                <TextField className="test-case-textfield" value={testCaseInfo.timeoutSeconds} type="number" label="Timeout seconds" initialValue="Timeout seconds" onChange={handleTimeoutChange}/>
            </div>
            <div className="text-testcases">
                <div className="testcases-title">
                    Tests:
                </div>
                {...textTestCaseComponents()}
            </div>
            <BlueButton className="new-text-test-case" onClick={createNewTestCase}>+ New Test</BlueButton>
            {isTestRun && <TestRunResults testCasesResults={fakeTestCaseResults} close={() => setTestRun(false)} />}
        </div>
    );
}

export default TextTestCasePanel;