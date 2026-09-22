import { useEffect, useRef, useState } from "react";
import QuestionScore from "../../components/question/QuestionScore";
import Spinner from "../../components/spinner/Spinner";
import { StudentAssignmentGradesResponse } from "../../models/grades";
import fetchWithAuth from "../../utils/fetcher";
import "../css/QuestionGradeDropdown.css";
import ExpandPanel from "./ExpandPanel";

interface StudentAssignmentGradePanelProps {
    classroomId: string;
    assignmentId: string;
    assignmentName: string;
    studentId: string;
    showGrade: boolean;
}

function StudentAssignmentGradePanel(props: StudentAssignmentGradePanelProps) {
    const [grades, setGrades] = useState<StudentAssignmentGradesResponse | null>(null);
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

            setGrades(await response.json() as StudentAssignmentGradesResponse);
        } catch (error) {
            if (!controller.signal.aborted) {
                setErrorMessage(error instanceof Error ? error.message : "Could not load assignment grades");
            }
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    };

    const assignmentPercentage = () => {
        if (grades === null) return undefined;

        const totals = grades.grades.reduce(
            (result, grade) => ({
                score: result.score + grade.score,
                maxPoints: result.maxPoints + grade.max_points,
            }),
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
                        : grades?.grades.map(grade => (
                            <div className="question-grade-dropdown" key={grade.question_id}>
                                <div className="question-grade-header">
                                    <div className="question-grade-title">{grade.question_name}</div>
                                    {props.showGrade &&
                                        <div className="question-grade-button">
                                            <QuestionScore score={grade.score} points={grade.max_points} numberOnly />
                                        </div>
                                    }
                                </div>
                            </div>
                        ))
            }
        </ExpandPanel>
    );
}

export default StudentAssignmentGradePanel;
