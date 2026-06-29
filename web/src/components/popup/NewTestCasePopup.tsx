import Popup, { PopupProps } from "./Popup";
import "./NewTestCasePopup.css";
import DarkBlueButton from "../buttons/DarkBlueButton";
import TextField, { TextFieldInput } from "../textfield/Textfield";
// import SelectDropdown from "../select-dropdown/SelectDropdown";
import { TestCase } from "../../models/testcases";
import { useState } from "react";

type NewTestCasePopupProps = Omit<PopupProps, 'children'> & {
    testcaseList: TestCase[];
    setSelect: (tcId: string) => void;
};


const defaultTimeout = 5
function NewTestCasePopup({onClose, testcaseList, setSelect}: NewTestCasePopupProps) {
    
    // const [selectedType, setSelectedType] = useState<TestCaseType>("text"); // bash test cases are a later feature
    const [testcaseName, setTestcaseName] = useState("");
    const [testcasePoints, setTestcasePoints] = useState<number | undefined>();

    // const handleTypeSelect = (newType: string) => {
    //     setSelectedType(textToType[newType])
    // }
    const handleTestcaseName = (input: TextFieldInput) => {
        const newName = input.value;
        setTestcaseName(newName);
    }
    const handleTestcasePoints = (input: TextFieldInput) => {
        const newPoints = Number(input.value);
        setTestcasePoints(newPoints);
    }

    // Bash test cases are a later feature — these type maps are kept for when it returns.
    // const textToType: Record<string, TestCaseType> = {
    //     "Compare Output": "text",
    //     "Bash Testcase": "bash"
    // }
    // const typeToText: Record<TestCaseType, string> = {
    //     "text": "Compare Output",
    //     "bash": "Bash Testcase"
    // }

    const createTestcase = () => {
        // Bash test cases are a later feature — only text ("Compare Output") test cases for now.
        // if (selectedType === "bash") {
        //     newTestCase = {
        //         id: crypto.randomUUID(),
        //         name: testcaseName,
        //         points: testcasePoints!,
        //         timeoutSeconds: defaultTimeout,
        //         type: selectedType,
        //         body: {
        //             primaryBashFile: {
        //                 id: crypto.randomUUID(),
        //                 name: "main",
        //                 suffix: "sh",
        //                 body: ""
        //             }
        //         }
        //     }
        //     testcaseList.push(newTestCase);
        // } else {
        const newTestCase: TestCase = {
            id: crypto.randomUUID(),
            name: testcaseName,
            points: testcasePoints!,
            timeoutSeconds: defaultTimeout,
            type: "text",
            body: {
                inputs: "",
                outputs: "",
                hidden: true
            }
        }
        testcaseList.push(newTestCase);
        // }
        setSelect(newTestCase.id);
        onClose();
    }
    return (
        <Popup onClose={onClose} className="new-testcase-popup">
            <div className="popup-title">
                Create Test Case
            </div>
            <TextField className="popup-textfield" label="Name" initialValue="Testcase Name" onChange={handleTestcaseName} />
            <TextField className="popup-textfield" label="Points" type="number" initialValue="Testcase Points" onChange={handleTestcasePoints} />
            {/* Bash test cases are a later feature — only text ("Compare Output") test cases for now.
            <div className="test-type-parent">
                <label className="test-type-label">Test Type</label>
                <SelectDropdown options={["Compare Output", "Bash Testcase"]} value={typeToText[selectedType]} className="test-type" onChange={handleTypeSelect}/>
            </div>
            */}
            <DarkBlueButton className="create-button" disabled={testcasePoints === undefined} onClick={createTestcase}>Create Test Case</DarkBlueButton>
        </Popup>
    );
}
export default NewTestCasePopup;