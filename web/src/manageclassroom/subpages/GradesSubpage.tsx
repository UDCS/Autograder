import { useCallback, useEffect, useRef, useState } from "react";
import { Classroom } from "../../models/classroom";
import GradeSwitcher, { GradeSection } from "../components/GradeSwitcher";
import "../css/GradesSubpage.css"
import AssignmentsGrades from "../components/AssignmentsGrades";
import StudentGrades from "../components/StudentGrades";
import clsx from "clsx";
import { ClassroomGrades, QuestionSubmission, SubmissionStatus } from "../../models/grades";

interface GradesSubpageProps {
    classroomInfo: Classroom;
}

function GradesSubpage({classroomInfo}: GradesSubpageProps) {
    const [currentSection, setCurrentSection] = useState<GradeSection>('assignments');
    const [classroomGrades, setClassroomGrades] = useState<ClassroomGrades>();
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const activeSubmissions = useRef<Set<string>>(new Set());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const updateSubmission = useCallback((submissionId: string, changes: Partial<QuestionSubmission>) => {
        setClassroomGrades(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                assignments: prev.assignments.map(assignment => ({
                    ...assignment,
                    questions: assignment.questions.map(question => ({
                        ...question,
                        submissions: question.submissions.map(submission =>
                            submission.submission_id === submissionId
                                ? { ...submission, ...changes }
                                : submission
                        )
                    }))
                }))
            };
        });
    }, []);

    const addSubmission = useCallback((submissionId: string) => {
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
                const res = await fetch('/api/grader/submissions/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ submission_ids: ids }),
                });
                if (!res.ok) return;
                const results = await res.json() as Array<{ submission_id: string; status: string; score: number; console_output: string }>;
                for (const r of results) {
                    if (r.status !== 'running') {
                        activeSubmissions.current.delete(r.submission_id);
                        updateSubmission(r.submission_id, {
                            status: r.status as SubmissionStatus,
                            score: r.score,
                            console_output: r.console_output,
                        });
                    }
                }
            } catch { /* ignore transient network errors */ }
        }, 2500);
    }, [updateSubmission]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        fetch(`/api/classroom/${classroomInfo.id}/grades`)
            .then(async r => {
                if (!r.ok) throw new Error(await r.text());
                return r.json();
            })
            .then(data => {
                const grades: ClassroomGrades = {
                    show_grades: false,
                    assignments: data.assignments.map((a: any) => ({
                        ...a,
                        questions: a.questions.map((q: any) => ({
                            ...q,
                            submissions: q.submissions.map((s: any) => ({
                                ...s,
                                show_grade: false,
                                edit_mode: false,
                            }))
                        }))
                    }))
                };
                setClassroomGrades(grades);
                // Resume polling for any submissions that were mid-grade when the page loaded
                for (const a of grades.assignments) {
                    for (const q of a.questions) {
                        for (const s of q.submissions) {
                            if (s.status === 'running') {
                                addSubmission(s.submission_id);
                            }
                        }
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                setErrorMessage(err.message);
                setLoading(false);
            });
    }, [classroomInfo.id, addSubmission]);

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
                        <AssignmentsGrades grades={classroomGrades!} updateSubmission={updateSubmission} classroomId={classroomInfo.id!} showGrades={classroomGrades!.show_grades} addSubmission={addSubmission} />
                    </div>
                    <div className={clsx(currentSection !== 'students' && 'hidden')}>
                        <StudentGrades grades={classroomGrades!} updateSubmission={updateSubmission} classroomId={classroomInfo.id!} showGrades={classroomGrades!.show_grades} addSubmission={addSubmission} />
                    </div>
                </>
            }
        </div>
    );
}
export default GradesSubpage;
