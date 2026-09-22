export type SubmissionStatus = 'running' | 'failed' | 'partial' | 'passed' | 'error';

// One entry in a student's grade-run history for a question (metadata only)
export interface SubmissionAttempt {
    id: string;
    submitted_at: string;
    score: number;
    status: SubmissionStatus;
    is_late: boolean;
}

// The atomic unit — one student's submission for one question
export interface QuestionSubmission {
    submission_id: string | null;
    student_id: string;
    student_name: string;
    score: number;
    code: string;
    console_output: string;
    manual_grade: number;
    status?: SubmissionStatus;
    is_late?: boolean;
    // the three checkboxes in the expanded panel
    show_grade: boolean;
    is_manual_grade: boolean;
    edit_mode: boolean;
}

// A question with all student submissions for it
export interface QuestionGrade {
    question_id: string;
    question_name: string;
    max_points: number;
    prog_lang: string;
    submissions: QuestionSubmission[];  // one per student
}

// An assignment with all its graded questions
export interface AssignmentGrade {
    assignment_id: string;
    assignment_name: string;
    questions: QuestionGrade[];
}

export interface StudentQuestionGrade {
    student_id: string;
    student_name: string;
    score: number;
    submission_id: string | null;
}

export interface QuestionGradesResponse {
    question_id: string;
    question_name: string;
    max_points: number;
    grades: StudentQuestionGrade[];
}

export interface SubmissionDetailsResponse {
    submission_id: string;
    code: string;
    console_output: string;
    is_manual_grade: boolean;
    manual_grade: number;
    status: SubmissionStatus;
}

export interface StudentAverageGrade {
    student_id: string;
    student_name: string;
    average_grade: number;
}

export interface ClassroomGradesResponse {
    grades: StudentAverageGrade[];
}

// The top-level grades state for the whole classroom
export interface ClassroomGrades {
    show_grades: boolean;       // the global "Show Grades" checkbox
    grades: StudentAverageGrade[];
    assignments: AssignmentGrade[];
}
