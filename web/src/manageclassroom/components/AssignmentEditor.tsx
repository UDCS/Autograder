import { useReducer, useState } from "react";
import CalendarInput from "../../components/calendar-input/CalendarInput";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import TextArea from "../../components/textarea/TextArea";
import TitleInput from "../../components/title-input/TitleInput";
import "../css/AssignmentEditor.css"
import QuestionEditor from "./QuestionEditor";
import clsx from "clsx";
import { Assignment, Question, Visibility } from "../../models/classroom";
import { assignmentStore, saveAssignments, saveQuestions } from "../subpages/AssignmentsSubpage";
import { createBlankQuestion } from "../../utils/classroom";
import DarkBlueButton from "../../components/buttons/DarkBlueButton";
import DeletePopup from "../../components/popup/DeletePopup";
import { deleteQuestionFromDatabase } from "../../utils/db";
import { showToast } from "../../components/toast/toastBus";
import ReorderArrows from "./ReorderArrows";

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
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

const assignmentTitleMaxLength = 64;

function AssignmentEditor({assignmentId, onDelete, onMoveUp, onMoveDown, isFirst, isLast}: AssignmentEditorProps) {
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const [deleteQuestionPopup, setDeleteQuestionPopup] = useState<boolean>(false);
    const [deleteQuestionId, setDeleteQuestionId] = useState<string>("");


    const assignment: Assignment = assignmentStore[assignmentId];
    if (!assignment.questions) assignment.questions = [];
    const [selected, setSelected] = useState(false);

    const triangle = () => {
        return selected ? "▲" : "▼"; 
    }
    const handleAssignmentTitleChange = (newTitle: string) => {
        assignment.name = newTitle;
    }
    const handleAssignmentDescriptionChange = (newDesc: string) => {
        assignment.description = newDesc;
    }
    const handleDueDateChange = (newDueDate: string) => {
        assignment.due_at = newDueDate;
    }
    const handleVisibilityChange = (newVisibility: string) => {
        assignment.assignment_mode = textToVisibility[newVisibility];
    }
    
    const createQuestion = () => {
        var newQuestion = createBlankQuestion(assignmentId);
        newQuestion.sort_index = assignment.questions?.length ?? 0;
        assignment.questions?.push(newQuestion);

        try {
            saveQuestions([newQuestion]);
        } catch (err) {
            console.error("Failed to save questions: ", err)
        }
        forceUpdate();
    }

    const sortedQuestions = (): Question[] =>
        ((assignment.questions as Question[]) ?? [])
            .slice()
            .sort((a, b) => (a.sort_index ?? 0) - (b.sort_index ?? 0));

    // Move a question up (-1) or down (+1), renumber sort_index contiguously,
    // and persist immediately.
    const moveQuestion = (questionId: string, direction: -1 | 1) => {
        const questions = sortedQuestions();
        const idx = questions.findIndex(q => q.id === questionId);
        const target = idx + direction;
        if (idx < 0 || target < 0 || target >= questions.length) return;
        [questions[idx], questions[target]] = [questions[target], questions[idx]];
        questions.forEach((q, i) => { q.sort_index = i; });
        assignment.questions = questions;
        forceUpdate();
        saveQuestions(questions)
            .then(() => showToast("Successfully saved", "success"))
            .catch(err => {
                console.error("Failed to save question order:", err);
                showToast("Something went wrong while saving", "error");
            });
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
        try {
            deleteQuestionFromDatabase(deleteQuestionId);
        } catch (err) {
            console.error("Failed to delete question, ", err)
        }
    }
    
    const saveAssignment = () => {
        saveAssignments([assignmentStore[assignmentId]])
            .then(() => showToast("Successfully saved", "success"))
            .catch(err => {
                console.error("Failed to save assignment:", err);
                showToast("Something went wrong while saving", "error");
            });
    }

    const questionsToComponents = () => {
        const questions = sortedQuestions();
        if (!questions) return [];
        return questions.map((q, i)=> {
            return <QuestionEditor key={q.id!} onDelete={() => makeDeletePopup(q.id!)} question={q}
                onMoveUp={() => moveQuestion(q.id!, -1)}
                onMoveDown={() => moveQuestion(q.id!, 1)}
                isFirst={i === 0}
                isLast={i === questions.length - 1} />
        })
    }

    return (
        <div className="reorderable-row">
            <ReorderArrows onMoveUp={onMoveUp} onMoveDown={onMoveDown} disableUp={isFirst} disableDown={isLast} />
            <div className="assignment-editor">
            <div className="title-and-visibility">
                <div className="title-parent">
                    <TitleInput placeholder="Assignment Title" value={assignment.name ?? ""} onChange={handleAssignmentTitleChange} maxLength={assignmentTitleMaxLength} />
                </div>
                <button className="expand-button" onClick={() => setSelected(!selected)}>{triangle()}</button>
            </div>
            <div className={clsx("assignment-body", !selected && "hidden")}>
                <div className="due-date-visibility">
                    <div className="due-date-parent">
                        <div className="label">Due Date:</div>
                        <CalendarInput defaultValue={assignment.due_at!} onChange={handleDueDateChange} />
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
                        <button className="edit-button save-button" onClick={saveAssignment}>
                            Save Assignment
                        </button>
                    </div>
                </div>
            </div>
            {deleteQuestionPopup && <DeletePopup onDelete={deleteQuestion} onClose={() => setDeleteQuestionPopup(false)} titleToDelete={assignment.questions!.find((q) => q.id === deleteQuestionId)!.header!}/>}
            </div>
        </div>
    );
}
export default AssignmentEditor;