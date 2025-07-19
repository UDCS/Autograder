export interface Classroom {
    id?: string;
    name?: string;
    created_at?: Date;
    updated_at?: Date;
    start_date?: string;
    end_date?: string;
    course_code?: string;
    course_description?: string;
    banner_image_index?: string;
}

export interface Assignment {
    id?: string;
    classroom_id?: string;
    name?: string;
    description?: string;
    assignment_mode?: string;
    due_at?: Date;
    created_at?: Date;
    updated_at?: Date;
    sort_index?: number;
    questions?: Question[];
}

export interface Question {
    id?: string;
    assignment_id?: string;
    header?: string;
    body?: string;
    points?: number;
    score?: number;
    sort_index?: number;
    default_code?: string;
    code?: string;
    prog_lang?: string;
}