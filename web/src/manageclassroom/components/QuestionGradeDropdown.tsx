import { useEffect, useRef, useState } from "react";
import fetchWithAuth from '../../utils/fetcher';
import QuestionScore from "../../components/question/QuestionScore";
import "../css/QuestionGradeDropdown.css"
import EditorHeader from "../../components/editor/EditorHeader";
import CodeEditor from "../../components/editor/CodeEditor";
import BlueButton from "../../components/buttons/BlueButton";
import ConsoleOutput from "../../components/assignment/ConsoleOutput";
import Spinner from "../../components/spinner/Spinner";
import { QuestionSubmission, SubmissionAttempt } from "../../models/grades";

const formatAttemptTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", timeZoneName: "short",
    });

interface QGDProps {
    questionSubmission: QuestionSubmission;
    updateSubmission: (submissionId: string, changes: Partial<QuestionSubmission>) => void;
    max_score: number;
    title?: string;
    classroomId: string;
    questionId: string;
    progLang: string;
    addSubmission: (submissionId: string) => void;
}
function QuestionGradeDropdown({questionSubmission, max_score, updateSubmission, title, classroomId, questionId, progLang, addSubmission}: QGDProps) {
    const [selected, setSelected] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    const [manualGrade, setManualGrade] = useState<boolean>(questionSubmission.is_manual_grade);
    const [editable, setEditable] = useState<boolean>(questionSubmission.edit_mode);
    const [gradeChanged, setGradeChanged] = useState<boolean>(false);
    const [history, setHistory] = useState<SubmissionAttempt[] | null>(null);
    const [historyLoading, setHistoryLoading] = useState<boolean>(false);
    const [historyExpanded, setHistoryExpanded] = useState<boolean>(false);
    const resubmitLockRef = useRef<boolean>(false);

    const triangle = () => selected ? "▲" : "▼";
    const displayScore = questionSubmission.is_manual_grade ? questionSubmission.manual_grade : questionSubmission.score;
    const gradesVisible = questionSubmission.show_grade;
    const status = questionSubmission.status;
    const isRunning = status === 'running';

    // Newest first; show only the 3 most recent until the dropdown is expanded.
    const sortedHistory = history
        ? [...history].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        : [];
    const visibleHistory = historyExpanded ? sortedHistory : sortedHistory.slice(0, 3);
    const hiddenCount = sortedHistory.length - visibleHistory.length;

    const loadHistory = () => {
        setHistoryLoading(true);
        fetchWithAuth(`/api/grader/question/${questionId}/submissions/history?student_id=${questionSubmission.student_id}`)
            .then(r => r.ok ? r.json() : [])
            .then((data: SubmissionAttempt[]) => setHistory(data))
            .catch(() => setHistory([]))
            .finally(() => setHistoryLoading(false));
    };

    // Load history the first time the panel is expanded.
    useEffect(() => {
        if (selected && history === null && !historyLoading) loadHistory();
    }, [selected]);

    // Refresh history once a grade run finishes (status leaves 'running').
    useEffect(() => {
        if (selected && status !== 'running' && history !== null) loadHistory();
    }, [status]);

    return (
        <div className="question-grade-dropdown">
            <div className="question-grade-header" onClick={() => setSelected(!selected)}>
                <div className="question-grade-title">
                    {title ?? questionSubmission.student_name}
                </div>
                <div className="question-grade-button">
                    {questionSubmission.is_late && <span className="late-badge">LATE</span>}
                    {gradesVisible && <QuestionScore score={displayScore} points={max_score} numberOnly />}
                    <div className="question-grade-triangle">
                        {triangle()}
                    </div>
                </div>
            </div>
            {selected &&
                <div className="question-grade-body">
                    <div className="question-grade-row">
                        <div className="question-grade-label">
                            Show Grade:
                        </div>
                        <div className="question-checkbox-parent">
                            <input type="checkbox" className="question-grade-checkbox" checked={questionSubmission.show_grade}
                            onChange={(e) => updateSubmission(questionSubmission.submission_id, { show_grade: e.target.checked })} />
                        </div>
                    </div>
                    <div className="question-grade-row">
                        <div className="question-grade-label">
                            Manual Grade:
                        </div>
                        <div className="question-checkbox-parent">
                            <input type="checkbox" className="question-grade-checkbox"
                                checked={manualGrade}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setManualGrade(e.target.checked);
                                    updateSubmission(questionSubmission.submission_id, { is_manual_grade: e.target.checked });
                                    setGradeChanged(true);
                                }}/>
                            <div className="manual-score-parent">
                                {manualGrade && <>
                                    <div className="question-grade-label">Score:</div>
                                    <input className="manual-score-input" type="number"
                                    value={questionSubmission.manual_grade}
                                    onChange={(e) => {
                                        updateSubmission(questionSubmission.submission_id, { manual_grade: e.target.valueAsNumber });
                                        setGradeChanged(true);
                                    }} />
                                </>}
                                {gradeChanged && <BlueButton className="question-button" onClick={() => {
                                    fetchWithAuth(`/api/classroom/${classroomId}/grades`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ updates: [{
                                            question_id: questionId,
                                            student_id: questionSubmission.student_id,
                                            manual_grade: manualGrade,
                                            new_score: questionSubmission.manual_grade,
                                        }]})
                                    });
                                    setGradeChanged(false);
                                }}>Update Grade</BlueButton>}
                            </div>
                        </div>
                    </div>
                    <div className="question-grade-row">
                        <div className="question-grade-label">
                            Edit Mode:
                        </div>
                        <div className="question-checkbox-parent">
                            <input type="checkbox" className="question-grade-checkbox" checked={editable}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setEditable(e.target.checked);
                                    updateSubmission(questionSubmission.submission_id, { edit_mode: e.target.checked });
                                }} />
                        </div>
                    </div>
                    <div className="submission-history">
                        <div className="submission-history-title">
                            Submission History{sortedHistory.length > 0 && ` (${sortedHistory.length})`}
                        </div>
                        {historyLoading && history === null
                            ? <Spinner />
                            : sortedHistory.length > 0
                                ? <>
                                    {visibleHistory.map(attempt => (
                                        <div className="submission-history-row" key={attempt.id}>
                                            <span className="submission-history-time">{formatAttemptTime(attempt.submitted_at)}</span>
                                            <span className="submission-history-score">{attempt.score}/{max_score}</span>
                                            <span className={`submission-history-status ${attempt.status}`}>{attempt.status}</span>
                                            {attempt.is_late && <span className="late-badge">LATE</span>}
                                        </div>
                                    ))}
                                    {sortedHistory.length > 3 &&
                                        <button className="submission-history-toggle" type="button"
                                            onClick={() => setHistoryExpanded(prev => !prev)}>
                                            {historyExpanded ? "Show less ▲" : `Show ${hiddenCount} more ▼`}
                                        </button>
                                    }
                                </>
                                : <div className="submission-history-empty">No submissions yet.</div>
                        }
                    </div>
                    <EditorHeader progLang={progLang} fontSize={fontSize} onFontSizeChange={setFontSize} />
                    <CodeEditor fontSize={fontSize} editable={editable} value={questionSubmission.code} language={progLang}
                        onChange={(newCode) => updateSubmission(questionSubmission.submission_id, { code: newCode })} />
                    <div className="question-button-row">
                        <BlueButton className="question-button" onClick={() => {
                            fetchWithAuth(`/api/classroom/question/${questionId}/submission`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    code: questionSubmission.code,
                                    user_id: questionSubmission.student_id,
                                })
                            });
                        }}>Save Code</BlueButton>
                        <BlueButton className="question-button" disabled={isRunning} onClick={() => {
                            // Prevent spam: ignore clicks while a grade run is in flight or still running.
                            if (resubmitLockRef.current || isRunning) return;
                            resubmitLockRef.current = true;
                            updateSubmission(questionSubmission.submission_id, { status: 'running' });
                            fetchWithAuth(`/api/grader/question/${questionId}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    user_id: questionSubmission.student_id,
                                    code: questionSubmission.code,
                                })
                            }).then(r => r.json())
                              .then(data => addSubmission(data.submission_id))
                              .finally(() => { resubmitLockRef.current = false; });
                        }}>{isRunning ? "Grading..." : "Resubmit Code"}</BlueButton>
                        {isRunning && <Spinner />}
                    </div>
                    <ConsoleOutput output={questionSubmission.console_output}></ConsoleOutput>
                </div>
            }
        </div>
    );
}

export default QuestionGradeDropdown;
