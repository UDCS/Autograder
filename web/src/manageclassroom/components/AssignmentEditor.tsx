import { useReducer, useState } from "react";
import CalendarInput from "../../components/calendar-input/CalendarInput";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import TextArea from "../../components/textarea/TextArea";
import TitleInput from "../../components/title-input/TitleInput";
import "../css/AssignmentEditor.css"
import QuestionEditor from "./QuestionEditor";
import clsx from "clsx";
import { Assignment, Question, Visibility } from "../../models/classroom";
import { assignmentStore } from "../subpages/AssignmentsSubpage";
import { createBlankQuestion, dateToString, parseDateString } from "../../utils/classroom";
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import DeletePopup from "../../components/popup/DeletePopup";

const visibilityToText = {
    "draft": "Draft",
    "view": "Visible"
}
const textToVisibility: Record<string, Visibility> = {
    "Draft": "draft",
    "Visible": "view"
}

type AssignmentEditorProps = {
    assignmentId: string;
    onDelete: () => void;
}

function AssignmentEditor({assignmentId, onDelete}: AssignmentEditorProps) {
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const [delteQuestionPopup, setDeleteQuestionPopup] = useState<boolean>(false);
    const [deleteQuestionId, setDeleteQuestionId] = useState<string>("");


    const assignment: Assignment = assignmentStore[assignmentId];
    const [selected, setSelected] = useState(false);

    const triangle = () => {
        return selected ? "▲" : "▼"; 
    }
    const handleAssignmentDescriptionChange = (newDesc: string) => {
        assignment.description = newDesc;
    }
    const handleDueDateChange = (newDueDate: string) => {
        let toDate = parseDateString(newDueDate);
        assignment.due_at = toDate;
    }
    const handleVisibilityChange = (newVisibility: string) => {
        assignment.assignment_mode = textToVisibility[newVisibility];
    }
    
    const createQuestion = () => {
        assignment.questions?.push(createBlankQuestion(assignmentId));
        forceUpdate();
    }
    const makeDeletePopup = (deleteId: string) => {
        if (assignment.questions!.length > 1) {
            setDeleteQuestionId(deleteId);
            setDeleteQuestionPopup(true);
        }
    }
    const deleteQuestion = () => {
        assignment.questions = assignment.questions?.filter((q) => q.id !== deleteQuestionId);
        setDeleteQuestionPopup(false);
        setDeleteQuestionId("");
    }

    const questionsToComponents = () => {
        const questions = assignment.questions as Question[];
        if (!questions) return [];
        return questions.map((q)=> {
            return <QuestionEditor key={q.id!} onDelete={() => makeDeletePopup(q.id!)} question={q} />
        })
    }

    return (
        <div className="assignment-editor">
            <div className="title-and-visibility">
                <div className="title-parent">
                    <TitleInput placeholder="Assignment Title" value={assignment.name ?? ""} />
                </div>
                <button className="expand-button" onClick={() => setSelected(!selected)}>{triangle()}</button>
            </div>
            <div className={clsx("assignment-body", !selected && "hidden")}>
                <div className="due-date-visibility">
                    <div className="due-date-parent">
                        <div className="label">Due Date:</div>
                        <CalendarInput defaultValue={dateToString(assignment.due_at!)} onChange={handleDueDateChange} />
                    </div>                
                    <div className="visibility-parent">
                        <div className="label">Visibility:</div>

                        <SelectDropdown onChange={handleVisibilityChange} className="visibility-input" defaultValue={visibilityToText[assignment.assignment_mode!]} options={["Draft", "Visible"]} />
                    </div>
                </div>
                <div className="description">
                    <div className="label">Assignment Description:</div>
                    <TextArea placeholder="Assignment Description" rows={5} value={assignment.description} onChange={handleAssignmentDescriptionChange} />
                </div>
                <div className="questions">
                    {...questionsToComponents()}
                    <DarkBlueButton className="create-new-question" onClick={createQuestion}>+ Create New Question</DarkBlueButton>
                </div>
                <div className="edit-buttons">
                    <div className="button-parent">
                        <button className="edit-button delete-button" onClick={onDelete}>
                            Delete Assignment
                        </button>
                    </div>
                    <div className="button-parent right-align">
                        <button className="edit-button save-button">
                            Save Assignment
                        </button>
                    </div>
                </div>
            </div>
            {delteQuestionPopup && <DeletePopup onDelete={deleteQuestion} onClose={() => setDeleteQuestionPopup(false)} titleToDelete={assignment.questions!.find((q) => q.id === deleteQuestionId)!.header!}/>}
        </div>
    );
}
export default AssignmentEditor;