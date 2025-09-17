import Popup, { PopupProps } from "./Popup";
import "./NewFilePopup.css";
import DarkBlueButton from "../buttons/DarkBlueButton";
import TextField, { TextFieldInput } from "../textfield/Textfield";
import { BashTestCaseBody, File } from "../../models/testcases";
import { fileName, parseFileName } from "../../utils/editor";
import { useState } from "react";
import GreyButton from "../buttons/GreyButton";

type NewFilePopupProps = Omit<PopupProps, 'children'> & {
    body: BashTestCaseBody;
};

function NewFilePopup({onClose, body}: NewFilePopupProps) {
    const allFiles = (body.otherFiles ?? []).concat(body.primaryBashFile).sort((a, b) => a.id > b.id ? -1 : 1);

    const [newFileName, setNewFileName] = useState("");
    const [error, setError] = useState("File needs a name");

    const createNewFile = () => {
        const newFile: File = {
            id: crypto.randomUUID(),
            body: "",
            ...parseFileName(newFileName)
        }
        if (!body.otherFiles) {
            body.otherFiles = [];
        }
        body.otherFiles?.push(newFile);
        onClose();
    }
    const handleFilenameChange = (input: TextFieldInput) => {
        const newFileName = input.value;
        setNewFileName(newFileName);
        if (allFiles.filter((f) => fileName(f) === newFileName).length > 0) {
            setError("New file cannot have name of existing file")
        } else if (!newFileName.includes(".") || newFileName.split(".").at(-1) === "") {
            setError("File must have an extension")
        } else if (newFileName.split(".")[0] === "") {
            setError("File needs a name")
        } else {
            setError("");
        }
    }
    return (
        <Popup onClose={onClose} className="new-file-popup">
            <div className="popup-title">
                Create New File
            </div>
            <TextField className="popup-textfield" label="File Name" initialValue="File Name" onChange={handleFilenameChange} />
            {error && 
                <span className="popup-error">{error}</span>
            }
            <div className="popup-buttons-parent">
                <div className="cancel-button-parent">
                    <GreyButton className="popup-cancel-button" onClick={onClose}>Cancel</GreyButton>
                </div>
                <div className="submit-button-parent">
                    <DarkBlueButton className="popup-submit-button" disabled={error !== ""} onClick={createNewFile}>Create File</DarkBlueButton>
                </div>
            </div>
        </Popup>
    );
}
export default NewFilePopup;