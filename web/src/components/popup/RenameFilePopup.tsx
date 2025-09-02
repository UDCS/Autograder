import Popup, { PopupProps } from "./Popup";
import "./NewFilePopup.css";
import DarkBlueButton from "../buttons/DarkBlueButton";
import TextField, { TextFieldInput } from "../textfield/Textfield";
import { BashTestCaseBody } from "../../models/testcases";
import { fileName, parseFileName } from "../../utils/editor";
import { useState } from "react";
import GreyButton from "../buttons/GreyButton";

type RenameFilePopupProps = Omit<PopupProps, 'children'> & {
    body: BashTestCaseBody;
    oldFileName: string;
};

function RenameFilePopup({onClose, body, oldFileName}: RenameFilePopupProps) {
    const allFiles = (body.otherFiles ?? []).concat(body.primaryBashFile).sort((a, b) => a.id > b.id ? -1 : 1);

    const [newFileName, setNewFileName] = useState(oldFileName);
    const [error, setError] = useState("");

    const renameFile = () => {
        if (oldFileName === fileName(body.primaryBashFile)) {
            const primaryBash = body.primaryBashFile
            body.primaryBashFile = {
                id: primaryBash.id,
                body: primaryBash.body,
                ...parseFileName(newFileName)
            }    
        } else {
            body.otherFiles = body.otherFiles?.map((f) => {
                if (fileName(f) === oldFileName) {
                    return {
                        id: f.id,
                        body: f.body,
                        ...parseFileName(newFileName)
                    }
                }
                return f
            })
        }
        onClose();
    }
    const handleFilenameChange = (input: TextFieldInput) => {
        const newFileName = input.value;
        setNewFileName(newFileName);
        if (allFiles.filter((f) => fileName(f) === newFileName && fileName(f) !== oldFileName).length > 0) {
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
                Rename "{oldFileName}"
            </div>
            <TextField className="popup-textfield" label="File Name" initialValue="File Name" onChange={handleFilenameChange} value={oldFileName} />
            {error && 
                <span className="popup-error">{error}</span>
            }
            <div className="popup-buttons-parent">
                <div className="cancel-button-parent">
                    <GreyButton className="popup-cancel-button" onClick={onClose}>Cancel</GreyButton>
                </div>
                <div className="submit-button-parent">
                    <DarkBlueButton className="popup-submit-button" disabled={error !== ""} onClick={renameFile}>Rename</DarkBlueButton>
                </div>
            </div>
        </Popup>
    );
}
export default RenameFilePopup;