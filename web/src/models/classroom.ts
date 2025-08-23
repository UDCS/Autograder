import { TestCase } from "./testcases";

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

export type Visibility = 'draft' | 'view';

export interface Assignment {
    id?: string;
    classroom_id?: string;
    name?: string;
    description?: string;
    assignment_mode?: Visibility;
    due_at?: Date;
    created_at?: Date;
    updated_at?: Date;
    sort_index?: number;
    questions?: Question[];
}

export type ProgLang = 'python' | 'c' | 'racket' | 'java';

export interface Question {
    id?: string;
    assignment_id?: string;
    header?: string;
    body?: string;
    points?: number;
    score?: number;
    sort_index?: number;
    default_code?: string;
    solution_code?: string;
    code?: string;
    prog_lang?: ProgLang;
    test_cases?: TestCase[];
}