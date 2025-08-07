import { useState } from "react";
import BlueButton from "../../components/buttons/BlueButton";
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import TextField from "../../components/textfield/Textfield";
import TitleInput from "../../components/title-input/TitleInput";
import { TestCase, TextInputOutput, TextTestCaseBody } from "../../models/testcases";
import "../css/TextTestCasePanel.css"
import TextTestCase from "./TextTestCase";

type TextTestCasePanelProps = {
    testCaseInfo: TestCase;
}

const blankTestCase: TextInputOutput = {
    inputs: "",
    outputs: "",
    hidden: true,
}

function TextTestCasePanel({testCaseInfo}: TextTestCasePanelProps) {

    const body = testCaseInfo.body as TextTestCaseBody;

    const [testCases, setTestCases] = useState(body.testCases);

    const deleteTestCase = (indexToDelete: number) => {
        setTestCases(testCases.filter((_, i) => i !== indexToDelete))
    }

    const textTestCaseComponents = () => {
        if (!testCases) return [];
        return testCases.map((testCase: TextInputOutput, index: number) => {
            return <TextTestCase onDelete={deleteTestCase} index={index} input={testCase.inputs} output={testCase.outputs} hidden={testCase.hidden} />
        });
    }

    const createNewTestCase = () => {
        setTestCases(testCases.concat(blankTestCase))
    }

    return (
        <div className="text-test-case-panel">
            <div className="title-run-test">
                <div className="test-case-title-parent">
                    <TitleInput className="test-case-title" value={testCaseInfo.name} />
                </div>
                <div className="test-case-run-parent">
                    <DarkBlueButton className="run-test-button">Run Test on Solution</DarkBlueButton>
                </div>
            </div>
            <div className="points-timeout">
                <TextField className="test-case-textfield" value={testCaseInfo.points} type="number" label="Points" initialValue="Points for this test case"/>
                <TextField className="test-case-textfield" value={testCaseInfo.timeoutSeconds} type="number" label="Timeout seconds" initialValue="Timeout seconds"/>
            </div>
            <div className="text-testcases">
                <div className="testcases-title">
                    Tests:
                </div>
                {...textTestCaseComponents()}
            </div>
            <BlueButton className="new-text-test-case" onClick={createNewTestCase}>+ New Test</BlueButton>
        </div>
    );
}

export default TextTestCasePanel;