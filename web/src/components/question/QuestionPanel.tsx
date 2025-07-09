import { Editor } from "@monaco-editor/react";
import "./QuestionPanel.css"
import BlueButton from "../bluebutton/BlueButton";
import QuestionScore from "./QuestionScore";
import ConsoleOutput from "../assignment/ConsoleOutput";
import { useState } from "react";

export interface Question {
    id?: string;
    assignment_id?: string;
    header?: string;
    body?: string;
    points?: number;
    score?: number;
    sort_index?: number;
    default_code?: string;
    code?: string;
    prog_lang?: string;
}

var timeLastChange = new Date();
const setTimeLastChange = (d: Date) => {
    timeLastChange = d;
}

function QuestionPanel({info}: {info: Question}) {
    const updateEveryChanges: number = 20;
    const inactivitySeconds: number = 5

    const [code, setCode] = useState(info.code === "" ? info.default_code : info.code);
    const [changes, setChanges] = useState(0);

    const updateUserCode = async (val?: string) => {
        const c = (val === undefined) ? code : val;
        const requestBody = {
            "code": c,
        }
        var response = await fetch(`/api/classroom/question/${info.id}/submission`, 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            }
        )

        if (!response.ok) {
            console.log(response);
        }
    }
    const resetTimeLastChange = () => {
        var d = new Date();
        setTimeLastChange(d);
    }
    const onChange = (val: string | undefined) => {
        setCode(val);

        if (changes >= updateEveryChanges) {
            setChanges(0);
            updateUserCode(val);
        } else {
            setChanges(changes+1);
        }
        resetTimeLastChange();

        setTimeout(() => {
            var now = new Date();
            var deltaSeconds = Math.abs((now.getTime() - timeLastChange.getTime()) / 1000);
            if (deltaSeconds >= inactivitySeconds) {
                resetTimeLastChange();
                updateUserCode(val);
            }
        }, inactivitySeconds * 1000);
    }
    const resetStarterCode = () => {
        setCode(info.default_code);
    };
    return <div className="questionPanel">
        <div className="questionTitle">{info.header}</div>
        <div className="questionDescription">{info.body}</div>
        <div className="resetStarterCodeParent">
            <button className="resetStarterCode" onClick={resetStarterCode}>Reset Starter Code</button>
        </div>
        <div className="editorParent">
            <Editor defaultLanguage={info.prog_lang} onChange={(val) => {
                onChange(val);
            }} value={code} />
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