import { ClassroomGrades, QuestionGrade, QuestionSubmission } from "../../models/grades";
import "../css/AssignmentsGrades.css"
import ExpandPanel from "./ExpandPanel";
import QuestionGradeDropdown from "./QuestionGradeDropdown";

interface StudentGradesProps {
    grades: ClassroomGrades;
    updateSubmission: (submissionId: string, changes: Partial<QuestionSubmission>) => void;
    classroomId: string;
    showGrades: boolean;
    addSubmission: (submissionId: string) => void;
}

function StudentGrades({ grades, updateSubmission, classroomId, addSubmission }: StudentGradesProps) {
    const studentMap = new Map<string, string>();
    for (const assignment of grades.assignments) {
        for (const question of assignment.questions) {
            for (const submission of question.submissions) {
                studentMap.set(submission.student_id, submission.student_name);
            }
        }
    }

    const calcStudentPercent = (studentId: string): number => {
        let totalScore = 0, totalMax = 0;
        for (const assignment of grades.assignments) {
            for (const question of assignment.questions) {
                const sub = question.submissions.find(s => s.student_id === studentId);
                if (sub) {
                    totalScore += sub.is_manual_grade ? sub.manual_grade : sub.score;
                    totalMax += question.max_points;
                }
            }
        }
        return totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    };

    const calcAssignmentPercent = (studentId: string, assignmentId: string): number => {
        let totalScore = 0, totalMax = 0;
        const assignment = grades.assignments.find(a => a.assignment_id === assignmentId);
        if (!assignment) return 0;
        for (const question of assignment.questions) {
            const sub = question.submissions.find(s => s.student_id === studentId);
            if (sub) {
                totalScore += sub.is_manual_grade ? sub.manual_grade : sub.score;
                totalMax += question.max_points;
            }
        }
        return totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    };

    return (
        <div className="assignments-grades">
            {Array.from(studentMap.entries()).map(([studentId, studentName]) => (
                <ExpandPanel key={studentId} title={studentName} grade={grades.show_grades ? calcStudentPercent(studentId) : undefined}>
                    {grades.assignments.map(assignment => {
                        const studentQuestions: QuestionGrade[] = assignment.questions
                            .filter(q => q.submissions.some(s => s.student_id === studentId))
                            .map(q => ({
                                ...q,
                                submissions: q.submissions.filter(s => s.student_id === studentId)
                            }));

                        if (studentQuestions.length === 0) return null;

                        return (
                            <ExpandPanel gap={false} key={assignment.assignment_id} title={assignment.assignment_name}
                                grade={grades.show_grades ? calcAssignmentPercent(studentId, assignment.assignment_id) : undefined}>
                                {studentQuestions.map(question => (
                                    <QuestionGradeDropdown
                                        key={question.question_id}
                                        questionSubmission={question.submissions[0]}
                                        max_score={question.max_points}
                                        updateSubmission={updateSubmission}
                                        title={question.question_name}
                                        classroomId={classroomId}
                                        questionId={question.question_id}
                                        progLang={question.prog_lang}
                                        addSubmission={addSubmission}
                                    />
                                ))}
                            </ExpandPanel>
                        );
                    })}
                </ExpandPanel>
            ))}
        </div>
    );
}

export default StudentGrades;
