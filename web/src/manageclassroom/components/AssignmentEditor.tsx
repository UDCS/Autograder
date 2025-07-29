import CalendarInput from "../../components/calendar-input/CalendarInput";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import TextArea from "../../components/textarea/TextArea";
import TitleInput from "../../components/title-input/TitleInput";
import "../css/AssignmentEditor.css"

function AssignmentEditor() {
    return (
        <div className="assignment-editor">
            <div className="title-and-visibility">
                <div className="title-parent">
                    <TitleInput placeholder="Assignment Title" />
                </div>
                <div className="visibility-parent">
                    <SelectDropdown className="visibility-input" options={["Draft", "Visible"]}/>
                </div>
            </div>
            <div className="due-date">
                <div className="label">Due Date:</div>
                <CalendarInput />
            </div>
            <div className="description">
                <div className="label">Description</div>
                <TextArea rows={5} />
            </div>
        </div>
    );
}
export default AssignmentEditor;