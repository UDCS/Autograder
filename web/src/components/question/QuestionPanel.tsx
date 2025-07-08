import { Editor } from "@monaco-editor/react";
import "./QuestionPanel.css"
import BlueButton from "../bluebutton/BlueButton";
import QuestionScore from "./QuestionScore";
import ConsoleOutput from "../assignment/ConsoleOutput";

export interface Question {
    id?: string;
    assignment_id?: string;
    header?: string;
    body?: string;
    points?: number;
    score?: number;
    sort_index?: number;
}

function QuestionPanel({info}: {info: Question}) {
    return <div className="questionPanel">
        <div className="questionTitle">{info.header}</div>
        <div className="questionDescription">{info.body}</div>
        <div className="resetStarterCodeParent">
            <button className="resetStarterCode">Reset Starter Code</button>
        </div>
        <div className="editorParent">
            <Editor language="python" />
        </div>
        <div className="submitAndScore">
            <div className="submitParent">
                <BlueButton className="submitButton">
                    Submit
                </BlueButton>
            </div>
            <div className="scoreParent">
                <QuestionScore score={info?.score} points={info?.points}/>
            </div>
        </div>
        <div className="consoleParent">
            <ConsoleOutput output={""}/>
        </div>
    </div>
}
export default QuestionPanel;