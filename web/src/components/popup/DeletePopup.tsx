import Popup, { PopupProps } from "./Popup";
import "./NewFilePopup.css";
import GreyButton from "../buttons/GreyButton";
import RedButton from "../buttons/RedButton";

type DeletePopupProps = Omit<PopupProps, 'children'> & {
    titleToDelete: string;
    onDelete: () => void;
    onClose: () => void;
    preTitle?: string;
    postTitle?: string;
    deleteButtonText?: string;
};

function DeletePopup({onClose, titleToDelete, onDelete, preTitle="Are you sure you want to delete ", postTitle="?", deleteButtonText="Delete"}: DeletePopupProps) {
    return (
        <Popup onClose={onClose} className="new-file-popup">
            <div className="popup-title">
                {preTitle}"{titleToDelete}"{postTitle}
            </div>
            <div className="popup-buttons-parent">
                <div className="cancel-button-parent">
                    <GreyButton className="popup-cancel-button" onClick={onClose}>Cancel</GreyButton>
                </div>
                <div className="submit-button-parent">
                    <RedButton className="popup-submit-button" onClick={onDelete}>{deleteButtonText}</RedButton>
                </div>
            </div>
        </Popup>
    );
}
export default DeletePopup;