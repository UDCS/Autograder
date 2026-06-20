import { useEffect, useState } from "react";
import { Classroom } from "../../models/classroom";
import GradeSwitcher, { GradeSection } from "../components/GradeSwitcher";
import "../css/GradesSubpage.css"
import AssignmentsGrades from "../components/AssignmentsGrades";
import StudentGrades from "../components/StudentGrades";
import clsx from "clsx";
import { ClassroomGrades, QuestionSubmission } from "../../models/grades";

interface GradesSubpageProps {
    classroomInfo: Classroom;
}

function GradesSubpage({classroomInfo}: GradesSubpageProps) {
    const [currentSection, setCurrentSection] = useState<GradeSection>('assignments');
    const [classroomGrades, setClassroomGrades] = useState<ClassroomGrades>();
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const updateSubmission = (submissionId: string, changes: Partial<QuestionSubmission>) => {
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
    }

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
                setLoading(false);
            })
            .catch(err => {
                setErrorMessage(err.message);
                setLoading(false);
            });
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
                        <AssignmentsGrades grades={classroomGrades!} updateSubmission={updateSubmission} classroomId={classroomInfo.id!} showGrades={classroomGrades!.show_grades} />
                    </div>
                    <div className={clsx(currentSection !== 'students' && 'hidden')}>
                        <StudentGrades grades={classroomGrades!} updateSubmission={updateSubmission} classroomId={classroomInfo.id!} showGrades={classroomGrades!.show_grades} />
                    </div>
                </>
            }
        </div>
    );
}
export default GradesSubpage;