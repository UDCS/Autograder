import { useCallback, useEffect, useRef, useState } from "react";
import fetchWithAuth from '../../utils/fetcher';
import { Classroom } from "../../models/classroom";
import GradeSwitcher, { GradeSection } from "../components/GradeSwitcher";
import "../css/GradesSubpage.css"
import AssignmentsGrades from "../components/AssignmentsGrades";
import StudentGrades from "../components/StudentGrades";
import clsx from "clsx";
import { AddSubmission, AssignmentGrade, ClassroomGrades, ClassroomGradesResponse, ManualGradeChanges, ManualGradeUpdateListener, QuestionGradesResponse, QuestionSubmission, RegisterManualGradeUpdateListener, SaveManualGrade, SubmissionStatus, SubmissionUpdateListener } from "../../models/grades";
import { Assignment } from "../../models/classroom";

interface GradesSubpageProps {
    classroomInfo: Classroom;
}

const manualGradeKey = (questionId: string, studentId: string) => `${questionId}:${studentId}`;

function GradesSubpage({classroomInfo}: GradesSubpageProps) {
    const [currentSection, setCurrentSection] = useState<GradeSection>('assignments');
    const [classroomGrades, setClassroomGrades] = useState<ClassroomGrades>();
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const activeSubmissions = useRef<Set<string>>(new Set());
    const submissionUpdateListeners = useRef<Map<string, Set<SubmissionUpdateListener>>>(new Map());
    const manualGradeUpdateListeners = useRef<Map<string, Set<ManualGradeUpdateListener>>>(new Map());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const updateSubmission = useCallback((submissionId: string | null, changes: Partial<QuestionSubmission>, studentId?: string) => {
        setClassroomGrades(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                assignments: prev.assignments.map(assignment => ({
                    ...assignment,
                    questions: assignment.questions.map(question => ({
                        ...question,
                        submissions: question.submissions.map(submission =>
                            submission.submission_id === submissionId && (submissionId !== null || submission.student_id === studentId)
                                ? { ...submission, ...changes }
                                : submission
                        )
                    }))
                }))
            };
        });
    }, []);

    const updateManualGrade = useCallback((questionId: string, studentId: string, changes: ManualGradeChanges) => {
        setClassroomGrades(previous => {
            if (!previous) return previous;
            return {
                ...previous,
                assignments: previous.assignments.map(assignment => ({
                    ...assignment,
                    questions: assignment.questions.map(question =>
                        question.question_id === questionId
                            ? {
                                ...question,
                                submissions: question.submissions.map(submission =>
                                    submission.student_id === studentId
                                        ? { ...submission, ...changes }
                                        : submission
                                ),
                            }
                            : question
                    ),
                })),
            };
        });
    }, []);

    const registerManualGradeUpdateListener: RegisterManualGradeUpdateListener = useCallback((questionId, studentId, listener) => {
        const key = manualGradeKey(questionId, studentId);
        const listeners = manualGradeUpdateListeners.current.get(key) ?? new Set();
        listeners.add(listener);
        manualGradeUpdateListeners.current.set(key, listeners);

        return () => {
            const currentListeners = manualGradeUpdateListeners.current.get(key);
            currentListeners?.delete(listener);
            if (currentListeners?.size === 0) manualGradeUpdateListeners.current.delete(key);
        };
    }, []);

    const refreshStudentAverages = useCallback(async () => {
        try {
            const response = await fetchWithAuth(`/api/classroom/${classroomInfo.id}/grades`);
            if (!response.ok) return;

            const data = await response.json() as ClassroomGradesResponse;
            setClassroomGrades(previous => previous ? { ...previous, grades: data.grades } : previous);
        } catch {
            // The grade was saved successfully; a later page load will refresh the averages.
        }
    }, [classroomInfo.id]);

    const saveManualGrade: SaveManualGrade = useCallback(async update => {
        const response = await fetchWithAuth(`/api/classroom/${classroomInfo.id}/grades`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ updates: [{
                question_id: update.question_id,
                student_id: update.student_id,
                manual_grade: update.is_manual_grade,
                new_score: update.manual_grade,
            }]}),
        });
        if (!response.ok) throw new Error(await response.text());

        const changes: ManualGradeChanges = {
            score: update.automatic_score,
            is_manual_grade: update.is_manual_grade,
            manual_grade: update.manual_grade,
        };
        updateManualGrade(update.question_id, update.student_id, changes);
        manualGradeUpdateListeners.current
            .get(manualGradeKey(update.question_id, update.student_id))
            ?.forEach(listener => listener(changes));
        await refreshStudentAverages();
    }, [classroomInfo.id, refreshStudentAverages, updateManualGrade]);

    const setQuestionGrades = useCallback((questionGrades: QuestionGradesResponse) => {
        setClassroomGrades(previous => {
            if (!previous) return previous;

            return {
                ...previous,
                assignments: previous.assignments.map(assignment => ({
                    ...assignment,
                    questions: assignment.questions.map(question =>
                        question.question_id === questionGrades.question_id
                            ? {
                                ...question,
                                question_name: questionGrades.question_name,
                                max_points: questionGrades.max_points,
                                submissions: questionGrades.grades.map(grade => ({
                                    submission_id: grade.submission_id,
                                    student_id: grade.student_id,
                                    student_name: grade.student_name,
                                    score: grade.score,
                                    code: "",
                                    console_output: "",
                                    manual_grade: grade.score,
                                    show_grade: previous.show_grades,
                                    is_manual_grade: false,
                                    edit_mode: false,
                                })),
                            }
                            : question
                    ),
                })),
            };
        });
    }, []);

    const addSubmission: AddSubmission = useCallback((submissionId, onUpdate) => {
        if (onUpdate) {
            const listeners = submissionUpdateListeners.current.get(submissionId) ?? new Set();
            listeners.add(onUpdate);
            submissionUpdateListeners.current.set(submissionId, listeners);
        }
        activeSubmissions.current.add(submissionId);
        if (intervalRef.current) return;
        intervalRef.current = setInterval(async () => {
            const ids = Array.from(activeSubmissions.current);
            if (ids.length === 0) {
                clearInterval(intervalRef.current!);
                intervalRef.current = null;
                return;
            }
            try {
                const res = await fetchWithAuth('/api/grader/submissions/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ submission_ids: ids }),
                });
                if (!res.ok) return;
                const results = await res.json() as Array<{ submission_id: string; status: string; score: number; console_output: string }>;
                for (const r of results) {
                    if (r.status !== 'running') {
                        activeSubmissions.current.delete(r.submission_id);
                        const changes: Partial<QuestionSubmission> = {
                            status: r.status as SubmissionStatus,
                            score: r.score,
                            console_output: r.console_output,
                        };
                        updateSubmission(r.submission_id, changes);
                        submissionUpdateListeners.current.get(r.submission_id)?.forEach(listener => listener(changes));
                        submissionUpdateListeners.current.delete(r.submission_id);
                    }
                }
            } catch { /* ignore transient network errors */ }
        }, 2500);
    }, [updateSubmission]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            submissionUpdateListeners.current.clear();
            manualGradeUpdateListeners.current.clear();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadGrades = async () => {
            setLoading(true);
            setErrorMessage("");
            try {
                const [gradesResponse, assignmentsResponse] = await Promise.all([
                    fetchWithAuth(`/api/classroom/${classroomInfo.id}/grades`),
                    fetchWithAuth(`/api/classroom/${classroomInfo.id}/view_assignments`),
                ]);
                if (!gradesResponse.ok) throw new Error(await gradesResponse.text());
                if (!assignmentsResponse.ok) throw new Error(await assignmentsResponse.text());

                const gradesData = await gradesResponse.json() as ClassroomGradesResponse;
                const assignmentsJson = await assignmentsResponse.json();
                const assignmentsData = assignmentsJson['assignments'] as Assignment[];
                const assignments: AssignmentGrade[] = assignmentsData.map(assignment => ({
                    assignment_id: assignment.id!,
                    assignment_name: assignment.name ?? "",
                    questions: (assignment.questions ?? []).map(question => ({
                        question_id: question.id!,
                        question_name: question.header ?? "",
                        max_points: question.points ?? 0,
                        prog_lang: question.prog_lang ?? "python",
                        submissions: [],
                    })),
                }));

                if (!cancelled) {
                    setClassroomGrades({
                        show_grades: false,
                        grades: gradesData.grades,
                        assignments,
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setErrorMessage(err instanceof Error ? err.message : "Could not load grades");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadGrades();
        return () => { cancelled = true; };
    }, [classroomInfo.id]);

    if (errorMessage) return <div className="error">{errorMessage}</div>;

    return (
        <div id="grades-subpage">
            {!loading &&
                <>
                    <GradeSwitcher onChange={(newSection: GradeSection) => {setCurrentSection(newSection)}}/>
                    <div id="show-grades-parent">
                        <h2 id="show-grades-title">Show Grades:</h2>
                        <input type='checkbox' id="show-grades-checkbox"
                            checked={classroomGrades!.show_grades}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setClassroomGrades(prev => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        show_grades: checked,
                                        assignments: prev.assignments.map(assignment => ({
                                            ...assignment,
                                            questions: assignment.questions.map(question => ({
                                                ...question,
                                                submissions: question.submissions.map(submission => ({
                                                    ...submission,
                                                    show_grade: checked,
                                                }))
                                            }))
                                        }))
                                    };
                                });
                            }} />
                    </div>
                    <div className={clsx(currentSection !== 'assignments' && 'hidden')}>
                        <AssignmentsGrades grades={classroomGrades!} updateSubmission={updateSubmission} classroomId={classroomInfo.id!} showGrades={classroomGrades!.show_grades} addSubmission={addSubmission} setQuestionGrades={setQuestionGrades} saveManualGrade={saveManualGrade} />
                    </div>
                    <div className={clsx(currentSection !== 'students' && 'hidden')}>
                        <StudentGrades grades={classroomGrades!.grades} showGrades={classroomGrades!.show_grades} classroomId={classroomInfo.id!} assignments={classroomGrades!.assignments} addSubmission={addSubmission} saveManualGrade={saveManualGrade} registerManualGradeUpdateListener={registerManualGradeUpdateListener} />
                    </div>
                </>
            }
        </div>
    );
}
export default GradesSubpage;
