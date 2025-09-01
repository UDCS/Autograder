import Popup, { PopupProps } from "./Popup";
import "./NewFilePopup.css";
import DarkBlueButton from "../buttons/DarkBlueButton";
import TextField, { TextFieldInput } from "../textfield/Textfield";
import { TestCase } from "../../models/testcases";
import { useState } from "react";
import GreyButton from "../buttons/GreyButton";
import { Question } from "../../models/classroom";
import { assignmentStore } from "../../manageclassroom/subpages/AssignmentsSubpage";

type CopyTestcasePopupProps = Omit<PopupProps, 'children'> & {
    question: Question;
    toCopy: TestCase;
};

function CopyTestcasePopup({onClose, toCopy, question}: CopyTestcasePopupProps) {
    const [testcaseName, setTestcaseName] = useState(toCopy.name);

    const handleTestcaseNameChange = (input: TextFieldInput) => {
        const newFileName = input.value;
        setTestcaseName(newFileName);
    }

    const copyTestCase = () => {
        const {name, id, ...copied} = structuredClone(toCopy);
        const newTestCase: TestCase = {
            name: testcaseName,
            id: crypto.randomUUID(),
            ...copied
        }
        question.test_cases?.push(newTestCase)
        console.log(assignmentStore)
        onClose();
    }

    return (
        <Popup onClose={onClose} className="new-file-popup">
            <div className="popup-title">
                Copy "{toCopy.name}"
            </div>
            <TextField className="popup-textfield" label="Test Case Name" initialValue="Test Case Name" onChange={handleTestcaseNameChange} value={toCopy.name} />
            <div className="popup-buttons-parent">
                <div className="cancel-button-parent">
                    <GreyButton className="popup-cancel-button" onClick={onClose}>Cancel</GreyButton>
                </div>
                <div className="submit-button-parent">
                    <DarkBlueButton className="popup-submit-button" onClick={copyTestCase}>Copy Test Case</DarkBlueButton>
                </div>
            </div>
        </Popup>
    );
}
export default CopyTestcasePopup;