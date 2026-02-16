// Auto-generated database types for Supabase
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    role: 'student' | 'doctor' | null
                    academic_id: string | null
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'student' | 'doctor' | null
                    academic_id?: string | null
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'student' | 'doctor' | null
                    academic_id?: string | null
                }
            }
            quizzes: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    code: string
                    instructor_id: string
                    start_time: string | null
                    duration_mins: number | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    code: string
                    instructor_id: string
                    start_time?: string | null
                    duration_mins?: number | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    code?: string
                    instructor_id?: string
                    start_time?: string | null
                    duration_mins?: number | null
                }
            }
            submissions: {
                Row: {
                    id: string
                    created_at: string
                    quiz_id: string
                    student_id: string
                    image_url: string
                    grade: number | null
                    status: 'pending' | 'graded'
                    feedback: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    quiz_id: string
                    student_id: string
                    image_url: string
                    grade?: number | null
                    status?: 'pending' | 'graded'
                    feedback?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    quiz_id?: string
                    student_id?: string
                    image_url?: string
                    grade?: number | null
                    status?: 'pending' | 'graded'
                    feedback?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
