// Database Types matching Supabase schema

export type UserRole = 'student' | 'doctor';
export type SubmissionStatus = 'pending' | 'graded';

export interface Profile {
    id: string; // UUID, references auth.users
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole | null;
    academic_id: string | null;
}

export interface Quiz {
    id: string; // UUID
    created_at: string;
    title: string;
    code: string; // 4-character unique code
    instructor_id: string; // References profiles(id)
    start_time: string | null;
    duration_mins: number | null;
}

export interface Submission {
    id: string; // UUID
    created_at: string;
    quiz_id: string; // References quizzes(id)
    student_id: string; // References profiles(id)
    image_url: string;
    grade: number | null;
    status: SubmissionStatus;
    feedback: string | null;
}

// Extended types with joins
export interface SubmissionWithStudent extends Submission {
    student: Profile;
}

export interface QuizWithInstructor extends Quiz {
    instructor: Profile;
}

// Form types
export interface CreateQuizInput {
    title: string;
    code: string;
    start_time: string;
    duration_mins: number;
}

export interface UpdateGradeInput {
    submission_id: string;
    grade: number;
    feedback?: string;
}
