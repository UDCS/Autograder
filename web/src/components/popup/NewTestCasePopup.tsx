import Popup, { PopupProps } from "./Popup";
import "./NewTestCasePopup.css";
import DarkBlueButton from "../buttons/DarkBlueButton";
import TextField, { TextFieldInput } from "../textfield/Textfield";
import SelectDropdown from "../select-dropdown/SelectDropdown";
import { TestCase, TestCaseType } from "../../models/testcases";
import { useState } from "react";

type NewTestCasePopupProps = Omit<PopupProps, 'children'> & {
    testcaseList: TestCase[];
};


const defaultTimeout = 5
function NewTestCasePopup({onClose, testcaseList}: NewTestCasePopupProps) {
    
    const [selectedType, setSelectedType] = useState<TestCaseType>("text");
    const [testcaseName, setTestcaseName] = useState("");
    const [testcasePoints, setTestcasePoints] = useState<number | undefined>();

    const handleTypeSelect = (newType: string) => {
        setSelectedType(textToType[newType])
    }
    const handleTestcaseName = (input: TextFieldInput) => {
        const newName = input.value;
        setTestcaseName(newName);
    }
    const handleTestcasePoints = (input: TextFieldInput) => {
        const newPoints = Number(input.value);
        setTestcasePoints(newPoints);
    }

    const textToType: Record<string, TestCaseType> = {
        "Compare Output": "text",
        "Bash Testcase": "bash"
    }
    const typeToText: Record<TestCaseType, string> = {
        "text": "Compare Output",
        "bash": "Bash Testcase"
    }

    const createTestcase = () => {
        if (selectedType === "bash") {
            const newTestCase: TestCase = {
                id: crypto.randomUUID(),
                name: testcaseName,
                points: testcasePoints!,
                timeoutSeconds: defaultTimeout,
                type: selectedType,
                body: {
                    primaryBashFile: {
                        id: crypto.randomUUID(),
                        name: "main",
                        suffix: "sh",
                        body: ""
                    }
                }
            }
            testcaseList.push(newTestCase);
        } else {
            const newTestCase: TestCase = {
                id: crypto.randomUUID(),
                name: testcaseName,
                points: testcasePoints!,
                timeoutSeconds: defaultTimeout,
                type: selectedType,
                body: {
                    testCases: []
                }
            }
            testcaseList.push(newTestCase);
        }
        onClose();
    }
    return (
        <Popup onClose={onClose} className="new-testcase-popup">
            <div className="popup-title">
                Create Test Case
            </div>
            <TextField className="popup-textfield" label="Name" initialValue="Testcase Name" onChange={handleTestcaseName} />
            <TextField className="popup-textfield" label="Points" type="number" initialValue="Testcase Points" onChange={handleTestcasePoints} />
            <div className="test-type-parent">
                <label className="test-type-label">Test Type</label>
                <SelectDropdown options={["Compare Output", "Bash Testcase"]} value={typeToText[selectedType]} className="test-type" onChange={handleTypeSelect}/>
            </div>
            <DarkBlueButton className="create-button" disabled={testcasePoints === undefined} onClick={createTestcase}>Create Test Case</DarkBlueButton>
        </Popup>
    );
}
export default NewTestCasePopup;