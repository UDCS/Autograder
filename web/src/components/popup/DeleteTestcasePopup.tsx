import Popup, { PopupProps } from "./Popup";
import "./NewFilePopup.css";
import GreyButton from "../buttons/GreyButton";
import RedButton from "../buttons/RedButton";
import { Question } from "../../models/classroom";

type DeleteTestcasePopup = Omit<PopupProps, 'children'> & {
    testcaseToDelete: string;
    question: Question;
    changeSelected: (id: string) => void;
};

function DeleteTestcasePopup({onClose, question, changeSelected, testcaseToDelete}: DeleteTestcasePopup) {
    const testCase = question.test_cases?.find((tc) => tc.id === testcaseToDelete);
    const deleteTestcase = () => {
        question.test_cases = question.test_cases?.filter((tc) => {
            return tc.id !== testcaseToDelete
        });
        if (question.test_cases) {
            changeSelected(question.test_cases[0].id)
        }
        onClose();
    }
    return (
        <Popup onClose={onClose} className="new-file-popup">
            <div className="popup-title">
                Are you <u>sure</u> you want to delete "{testCase?.name}"?
            </div>
            <div className="popup-buttons-parent">
                <div className="cancel-button-parent">
                    <GreyButton className="popup-cancel-button" onClick={onClose}>Cancel</GreyButton>
                </div>
                <div className="submit-button-parent">
                    <RedButton className="popup-submit-button" onClick={deleteTestcase}>Delete</RedButton>
                </div>
            </div>
        </Popup>
    );
}
export default DeleteTestcasePopup;