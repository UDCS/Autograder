import TitleInput from "../../components/title-input/TitleInput"
import "../css/QuestionEditor.css"
import "../css/AssignmentEditor.css"
import TextArea from "../../components/textarea/TextArea";
import TestCasesTabs from "./TestCasesTabs";
import { useState } from "react";
import clsx from "clsx";
import { ProgLang, Question } from "../../models/classroom";
import SelectDropdown from "../../components/select-dropdown/SelectDropdown";
import { saveQuestions } from "../subpages/AssignmentsSubpage";

type QuestionEditorProps = {
    question: Question;
    onDelete: () => void;
}

const progLangToText: Record<ProgLang, string> = {
    "python": "Python",
    "c": "C",
    "racket": "Racket",
    "java": "Java"
}

const textToProgLang: Record<string, ProgLang> = {
    "Python": "python",
    "C": "c",
    "Racket": "racket",
    "Java": "java"
}

const questionTitleMaxLength = 64;

function QuestionEditor({question, onDelete}: QuestionEditorProps) {
    const [selected, setSelected] = useState(false);
    
    const [progLang, setProgLang] = useState<ProgLang>(question.prog_lang!);
    const triangle = () => {
        return selected ? "▲" : "▼"; 
    }

    const handleTitleChange = (newTitle: string) => {
        question.header = newTitle;
    }
    const handleDescriptionChange = (newDesc: string) => {
        question.body = newDesc;
    }
    const handleProgLangChange = (newProgLang: string) => {
        question.prog_lang = textToProgLang[newProgLang];
        setProgLang(textToProgLang[newProgLang]);
    }

    const saveQuestion = () => {
        try {
            saveQuestions([question]);
        } catch (err) {
            console.error("Failed to save question: ", err)
        }
    }

    return (
        <div className="question-editor">
            <div className="title-and-visibility">
                <div className="title-parent">
                    <TitleInput placeholder="Question Title" value={question.header} onChange={handleTitleChange} maxLength={questionTitleMaxLength} />
                </div>
                <button className="expand-button" onClick={() => setSelected(!selected)}>{triangle()}</button>
            </div>
            <div className={clsx(selected && "question-body", !selected && "hidden")}>
                <div className="description">
                    <div className="label">Question Description:</div>
                    <TextArea placeholder="Question Description" rows={5} value={question.body} onChange={handleDescriptionChange} />
                </div>
                <div className="prog-lang">
                    <div className="label">
                        Question Programming Language:
                    </div>
                    <div className="prog-lang-parent">
                        <SelectDropdown className="prog-lang-select" value={progLangToText[progLang]} options={['Python', 'C', 'Java', 'Racket']} onChange={handleProgLangChange}/>
                    </div>
                </div>
                <TestCasesTabs question={question} />
                <div className="edit-buttons">
                    <div className="button-parent">
                        <button className="edit-button delete-button" onClick={onDelete}>
                            Delete Question
                        </button>
                    </div>
                    <div className="button-parent right-align" onClick={saveQuestion}>
                        <button className="edit-button save-button">
                            Save Question
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default QuestionEditor;