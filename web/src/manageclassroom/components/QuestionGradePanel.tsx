import { useEffect, useRef, useState } from "react";
import Spinner from "../../components/spinner/Spinner";
import { AddSubmission, QuestionGrade, QuestionGradesResponse, QuestionSubmission, SaveManualGrade } from "../../models/grades";
import fetchWithAuth from "../../utils/fetcher";
import "../css/QuestionGradePanel.css"

import ExpandPanel from "./ExpandPanel";
import QuestionGradeDropdown from "./QuestionGradeDropdown";

interface QuestionGradePanelProps {
    questionGrade: QuestionGrade;
    updateSubmission: (submissionId: string | null, changes: Partial<QuestionSubmission>, studentId?: string) => void;
    classroomId: string;
    addSubmission: AddSubmission;
    setQuestionGrades: (questionGrades: QuestionGradesResponse) => void;
    saveManualGrade: SaveManualGrade;
}

function QuestionGradePanel({questionGrade, updateSubmission, classroomId, addSubmission, setQuestionGrades, saveManualGrade}: QuestionGradePanelProps) {
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const requestController = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => requestController.current?.abort();
    }, []);

    const loadGrades = async (expanded: boolean) => {
        if (!expanded || loaded || loading) return;

        const controller = new AbortController();
        requestController.current = controller;
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetchWithAuth(
                `/api/classroom/${classroomId}/question/${questionGrade.question_id}/grades`,
                { signal: controller.signal },
            );
            if (!response.ok) throw new Error(await response.text());

            const questionGrades = await response.json() as QuestionGradesResponse;
            setQuestionGrades(questionGrades);
            setLoaded(true);
        } catch (error) {
            if (!controller.signal.aborted) {
                setErrorMessage(error instanceof Error ? error.message : "Could not load question grades");
            }
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    };

    const questionSubmissionsToPanels = () => {
        return questionGrade.submissions.map((questionSubmission: QuestionSubmission) => {
            return <QuestionGradeDropdown key={`${questionGrade.question_id}-${questionSubmission.student_id}`} questionSubmission={questionSubmission} max_score={questionGrade.max_points} updateSubmission={updateSubmission} classroomId={classroomId} questionId={questionGrade.question_id} progLang={questionGrade.prog_lang} addSubmission={addSubmission} saveManualGrade={saveManualGrade} />
        });
    }
    return (
        <ExpandPanel title={questionGrade.question_name} gap={false} onExpandedChange={loadGrades}>
            {loading ? <Spinner /> : errorMessage ? <div className="error">{errorMessage}</div> : questionSubmissionsToPanels()}
        </ExpandPanel>
    );
}

export default QuestionGradePanel;
