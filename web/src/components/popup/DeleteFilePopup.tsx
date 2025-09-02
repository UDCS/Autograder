import Popup, { PopupProps } from "./Popup";
import "./NewFilePopup.css";
import { BashTestCaseBody } from "../../models/testcases";
import { fileName } from "../../utils/editor";
import GreyButton from "../buttons/GreyButton";
import RedButton from "../buttons/RedButton";

type DeleteFilePopupProps = Omit<PopupProps, 'children'> & {
    body: BashTestCaseBody;
    fileToDelete: string;
};

function DeleteFilePopup({onClose, body, fileToDelete}: DeleteFilePopupProps) {
    const deleteFile = () => {
        body.otherFiles = body.otherFiles?.filter((f) => fileName(f) !== fileToDelete)
        onClose();
    }
    return (
        <Popup onClose={onClose} className="new-file-popup">
            <div className="popup-title">
                Are you <u>sure</u> you want to delete "{fileToDelete}"?
            </div>
            <div className="popup-buttons-parent">
                <div className="cancel-button-parent">
                    <GreyButton className="popup-cancel-button" onClick={onClose}>Cancel</GreyButton>
                </div>
                <div className="submit-button-parent">
                    <RedButton className="popup-submit-button" onClick={deleteFile}>Delete</RedButton>
                </div>
            </div>
        </Popup>
    );
}
export default DeleteFilePopup;