import Popup, { PopupProps } from "./Popup";
import "./NewFilePopup.css";
import GreyButton from "../buttons/GreyButton";
import RedButton from "../buttons/RedButton";

type DeletePopupProps = Omit<PopupProps, 'children'> & {
    titleToDelete: string;
    onDelete: () => void;
};

function DeletePopup({onClose, titleToDelete, onDelete}: DeletePopupProps) {
    return (
        <Popup onClose={onClose} className="new-file-popup">
            <div className="popup-title">
                Are you <u>sure</u> you want to delete "{titleToDelete}"?
            </div>
            <div className="popup-buttons-parent">
                <div className="cancel-button-parent">
                    <GreyButton className="popup-cancel-button" onClick={onClose}>Cancel</GreyButton>
                </div>
                <div className="submit-button-parent">
                    <RedButton className="popup-submit-button" onClick={onDelete}>Delete</RedButton>
                </div>
            </div>
        </Popup>
    );
}
export default DeletePopup;