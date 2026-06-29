import { useState } from "react";
import QuestionScore from "../../components/question/QuestionScore";
import "../css/QuestionGradeDropdown.css"
import EditorHeader from "../../components/editor/EditorHeader";
import CodeEditor from "../../components/editor/CodeEditor";
import BlueButton from "../../components/buttons/BlueButton";
import ConsoleOutput from "../../components/assignment/ConsoleOutput";
import Spinner from "../../components/spinner/Spinner";
import { QuestionSubmission } from "../../models/grades";

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

    const triangle = () => selected ? "▲" : "▼";
    const displayScore = questionSubmission.is_manual_grade ? questionSubmission.manual_grade : questionSubmission.score;
    const gradesVisible = questionSubmission.show_grade;

    return (
        <div className="question-grade-dropdown">
            <div className="question-grade-header" onClick={() => setSelected(!selected)}>
                <div className="question-grade-title">
                    {title ?? questionSubmission.student_name}
                </div>
                <div className="question-grade-button">
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
                                    fetch(`/api/classroom/${classroomId}/grades`, {
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
                    <EditorHeader progLang={progLang} fontSize={fontSize} onFontSizeChange={setFontSize} />
                    <CodeEditor fontSize={fontSize} editable={editable} value={questionSubmission.code} language={progLang}
                        onChange={(newCode) => updateSubmission(questionSubmission.submission_id, { code: newCode })} />
                    <div className="question-button-row">
                        <BlueButton className="question-button" onClick={() => {
                            fetch(`/api/classroom/question/${questionId}/submission`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    code: questionSubmission.code,
                                    user_id: questionSubmission.student_id,
                                })
                            });
                        }}>Save Code</BlueButton>
                        <BlueButton className="question-button" onClick={() => {
                            updateSubmission(questionSubmission.submission_id, { status: 'running' });
                            fetch(`/api/grader/question/${questionId}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    user_id: questionSubmission.student_id,
                                    code: questionSubmission.code,
                                })
                            }).then(r => r.json())
                              .then(data => addSubmission(data.submission_id));
                        }}>Resubmit Code</BlueButton>
                        {questionSubmission.status === 'running' && <Spinner />}
                    </div>
                    <ConsoleOutput output={questionSubmission.console_output}></ConsoleOutput>
                </div>
            }
        </div>
    );
}

export default QuestionGradeDropdown;
