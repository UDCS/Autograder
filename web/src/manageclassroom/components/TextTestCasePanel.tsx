import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import TextField, { TextFieldInput } from "../../components/textfield/Textfield";
import TitleInput from "../../components/title-input/TitleInput";
import { TestCase, TextTestCaseBody } from "../../models/testcases";
import "../css/TextTestCasePanel.css"
import TextTestCase from "./TextTestCase";
import Spinner from "../../components/spinner/Spinner";

export type TestCasePanelProps = {
    testCaseInfo: TestCase;
    runSolution: (testcaseId?: string) => void;
    generateOutput: (testcaseId: string) => void;
    busy?: boolean;
    loading?: boolean;
}

function TextTestCasePanel({testCaseInfo, runSolution, generateOutput, busy, loading}: TestCasePanelProps) {

    const body = testCaseInfo.body as TextTestCaseBody;

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
                    <DarkBlueButton className="run-test-button" disabled={busy} onClick={() => runSolution(testCaseInfo.id)}>Run Test on Solution</DarkBlueButton>
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
                <TextTestCase body={body}></TextTestCase>
                <div className="generate-output-parent">
                    {loading && <Spinner />}
                    <DarkBlueButton className="generate-output-button" disabled={busy} onClick={() => generateOutput(testCaseInfo.id)}>Generate Expected Output</DarkBlueButton>
                </div>
            </div>
        </div>
    );
}

export default TextTestCasePanel;
