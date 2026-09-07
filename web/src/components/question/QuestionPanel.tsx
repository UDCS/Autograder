import { Editor } from "@monaco-editor/react";
import "./QuestionPanel.css"
import BlueButton from "../buttons/BlueButton";
import QuestionScore from "./QuestionScore";
import ConsoleOutput from "../assignment/ConsoleOutput";
import EditorHeader from "../editor/EditorHeader";
import { registerRacket } from "../editor/racketLanguage";
import { useEffect, useRef, useState } from "react";
import fetchWithAuth from '../../utils/fetcher';
import { Question } from "../../models/classroom";
import Spinner from "../spinner/Spinner";

var timeLastChange = new Date();
const setTimeLastChange = (d: Date) => {
    timeLastChange = d;
}

function QuestionPanel({info}: {info: Question}) {
    const updateEveryChanges: number = 20;
    const inactivitySeconds: number = 5

    const [code, setCode] = useState(info.code === "" ? info.default_code : info.code);
    const [changes, setChanges] = useState(0);
    const [score, setScore] = useState<number>(info.score ?? 0);
    const [fontSize, setFontSize] = useState(16);
    const [consoleOutput, setConsoleOutput] = useState<string>(info.console_output ?? '');
    const [grading, setGrading] = useState(info.submission_status === 'running');

    const activeSubmissionId = useRef<string | undefined>(info.submission_id ?? undefined);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const submitLockRef = useRef<boolean>(false);

    useEffect(() => {
        if (!grading) return;
        const sid = activeSubmissionId.current;
        if (!sid) return;

        intervalRef.current = setInterval(async () => {
            try {
                const res = await fetchWithAuth('/api/grader/submissions/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ submission_ids: [sid] }),
                });
                if (!res.ok) return;
                const results = await res.json();
                if (results.length > 0 && results[0].status !== 'running') {
                    setGrading(false);
                    setScore(results[0].score);
                    setConsoleOutput(results[0].console_output);
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                }
            } catch { /* ignore transient errors */ }
        }, 2500);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [grading]);

    const updateUserCode = async (val?: string) => {
        const c = (val === undefined) ? code : val;
        const requestBody = {
            "code": c,
        }
        var response = await fetchWithAuth(`/api/classroom/question/${info.id}/submission`,
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
    const onSubmit = async () => {
        // Prevent spam: ignore clicks while a submission is in flight or still grading.
        if (submitLockRef.current || grading) return;
        submitLockRef.current = true;
        try {
            const res = await fetchWithAuth(`/api/grader/question/${info.id!}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            if (res.ok) {
                const data = await res.json();
                activeSubmissionId.current = data.submission_id;
                setGrading(true);
            }
        } finally {
            submitLockRef.current = false;
        }
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
    return <div className="questionPanel" id={info.id}>
        <div className="questionTitle">{info.header}</div>
        <div className="questionDescription">{info.body}</div>
        <div className="resetStarterCodeParent">
            <button className="resetStarterCode" onClick={resetStarterCode}>Reset Starter Code</button>
        </div>
        <EditorHeader progLang={info.prog_lang} fontSize={fontSize} onFontSizeChange={setFontSize} />
        <div className="editorParent">
            <Editor beforeMount={registerRacket} defaultLanguage={info.prog_lang} onChange={(val) => {
                onChange(val);
            }} value={code} options={{ fontSize }} />
        </div>
        <div className="submitAndScore">
            <div className="submitParent">
                <BlueButton className="submitButton" onClick={onSubmit} disabled={grading}>
                    {grading ? "Submitting..." : "Submit"}
                </BlueButton>
                {grading && <Spinner />}
            </div>
            <div className="scoreParent">
                <QuestionScore score={score} points={info?.points}/>
            </div>
        </div>
        <div className="consoleParent">
            <ConsoleOutput output={consoleOutput}/>
        </div>
    </div>
}
export default QuestionPanel;
