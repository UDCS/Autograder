import { useCallback, useEffect, useRef, useState } from "react";
import Spinner from "../../components/spinner/Spinner";
import { AddSubmission, QuestionGrade, QuestionSubmission, RegisterManualGradeUpdateListener, SaveManualGrade, StudentAssignmentGradesResponse } from "../../models/grades";
import fetchWithAuth from "../../utils/fetcher";
import ExpandPanel from "./ExpandPanel";
import QuestionGradeDropdown from "./QuestionGradeDropdown";

interface StudentAssignmentGradePanelProps {
    classroomId: string;
    assignmentId: string;
    assignmentName: string;
    questions: QuestionGrade[];
    studentId: string;
    studentName: string;
    showGrade: boolean;
    addSubmission: AddSubmission;
    saveManualGrade: SaveManualGrade;
    registerManualGradeUpdateListener: RegisterManualGradeUpdateListener;
}

function StudentAssignmentGradePanel(props: StudentAssignmentGradePanelProps) {
    const [grades, setGrades] = useState<StudentAssignmentGradesResponse | null>(null);
    const [questionSubmissions, setQuestionSubmissions] = useState<Record<string, QuestionSubmission>>({});
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const requestController = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => requestController.current?.abort();
    }, []);

    const loadGrades = async (expanded: boolean) => {
        if (!expanded || grades !== null || loading) return;

        const controller = new AbortController();
        requestController.current = controller;
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetchWithAuth(
                `/api/classroom/${props.classroomId}/assignment/${props.assignmentId}/student/${props.studentId}`,
                { signal: controller.signal },
            );
            if (!response.ok) throw new Error(await response.text());

            const assignmentGrades = await response.json() as StudentAssignmentGradesResponse;
            setGrades(assignmentGrades);
            setQuestionSubmissions(Object.fromEntries(
                assignmentGrades.grades.map(grade => [
                    grade.question_id,
                    {
                        submission_id: grade.submission_id,
                        student_id: assignmentGrades.student_id,
                        student_name: props.studentName,
                        score: grade.score,
                        code: "",
                        console_output: "",
                        manual_grade: grade.score,
                        show_grade: props.showGrade,
                        is_manual_grade: false,
                        edit_mode: false,
                    },
                ]),
            ));
        } catch (error) {
            if (!controller.signal.aborted) {
                setErrorMessage(error instanceof Error ? error.message : "Could not load assignment grades");
            }
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    };

    useEffect(() => {
        setQuestionSubmissions(previous => Object.fromEntries(
            Object.entries(previous).map(([questionId, submission]) => [
                questionId,
                { ...submission, show_grade: props.showGrade },
            ]),
        ));
    }, [props.showGrade]);

    const updateQuestionSubmission = useCallback((questionId: string, changes: Partial<QuestionSubmission>) => {
        setQuestionSubmissions(previous => {
            const submission = previous[questionId];
            if (!submission) return previous;
            return {
                ...previous,
                [questionId]: { ...submission, ...changes },
            };
        });
    }, []);

    useEffect(() => {
        if (grades === null) return;

        const unregisterListeners = grades.grades.map(grade =>
            props.registerManualGradeUpdateListener(
                grade.question_id,
                props.studentId,
                changes => updateQuestionSubmission(grade.question_id, changes),
            )
        );
        return () => unregisterListeners.forEach(unregister => unregister());
    }, [grades, props.registerManualGradeUpdateListener, props.studentId, updateQuestionSubmission]);

    const assignmentPercentage = () => {
        if (grades === null) return undefined;

        const totals = grades.grades.reduce(
            (result, grade) => {
                const submission = questionSubmissions[grade.question_id];
                const score = submission?.is_manual_grade ? submission.manual_grade : submission?.score ?? grade.score;
                return {
                    score: result.score + score,
                    maxPoints: result.maxPoints + grade.max_points,
                };
            },
            { score: 0, maxPoints: 0 },
        );
        return totals.maxPoints > 0 ? totals.score / totals.maxPoints * 100 : 0;
    };

    return (
        <ExpandPanel
            title={grades?.assignment_name ?? props.assignmentName}
            grade={props.showGrade ? assignmentPercentage() : undefined}
            gap={false}
            onExpandedChange={loadGrades}
        >
            {loading
                ? <Spinner />
                : errorMessage
                    ? <div className="error">{errorMessage}</div>
                    : grades?.grades.length === 0
                        ? <div>No questions in this assignment.</div>
                        : grades?.grades.map(grade => {
                            const questionSubmission = questionSubmissions[grade.question_id];
                            if (!questionSubmission) return null;

                            const question = props.questions.find(item => item.question_id === grade.question_id);
                            return (
                                <QuestionGradeDropdown
                                    key={grade.question_id}
                                    questionSubmission={questionSubmission}
                                    updateSubmission={(_submissionId, changes) => updateQuestionSubmission(grade.question_id, changes)}
                                    max_score={grade.max_points}
                                    title={grade.question_name}
                                    classroomId={props.classroomId}
                                    questionId={grade.question_id}
                                    progLang={question?.prog_lang ?? "python"}
                                    addSubmission={props.addSubmission}
                                    saveManualGrade={props.saveManualGrade}
                                />
                            );
                        })
            }
        </ExpandPanel>
    );
}

export default StudentAssignmentGradePanel;
