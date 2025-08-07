import { useState } from "react";
import CalendarInput from "../../components/calendar-input/CalendarInput";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import TextArea from "../../components/textarea/TextArea";
import TitleInput from "../../components/title-input/TitleInput";
import "../css/AssignmentEditor.css"
import QuestionEditor from "./QuestionEditor";
import clsx from "clsx";

function AssignmentEditor() {
    const [selected, setSelected] = useState(false);
    const triangle = () => {
        return selected ? "▲" : "▼"; 
    }
    return (
        <div className="assignment-editor">
            <div className="title-and-visibility">
                <div className="title-parent">
                    <TitleInput placeholder="Assignment Title" />
                </div>
                <button className="expand-button" onClick={() => setSelected(!selected)}>{triangle()}</button>
            </div>
            <div className={clsx("assignment-body", !selected && "hidden")}>
                <div className="due-date-visibility">
                    <div className="due-date-parent">
                        <div className="label">Due Date:</div>
                        <CalendarInput />
                    </div>                
                    <div className="visibility-parent">
                        <div className="label">Visibility:</div>

                        <SelectDropdown className="visibility-input" options={["Draft", "Visible"]}/>
                    </div>
                </div>
                <div className="description">
                    <div className="label">Assignment Description:</div>
                    <TextArea placeholder="Assignment Description" rows={5} />
                </div>
                <div className="questions">
                    <QuestionEditor />
                </div>
            </div>
        </div>
    );
}
export default AssignmentEditor;