"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Clock, FileCheck, FileX, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface QuizWithSubmission {
    id: string;
    title: string;
    code: string;
    start_time: string | null;
    duration_mins: number | null;
    submission?: {
        id: string;
        status: string;
        grade: number | null;
        created_at: string;
    } | null;
}

export default function StudentQuizzesPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<QuizWithSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile || profile.role !== 'student') {
            router.push('/');
            return;
        }

        fetchQuizzes();
    }, [profile, router]);

    const fetchQuizzes = async () => {
        if (!profile) return;

        try {
            setLoading(true);

            // Fetch all quizzes
            const { data: quizzesData, error: quizzesError } = await supabase
                .from('quizzes')
                .select('id, title, code, start_time, duration_mins')
                .order('start_time', { ascending: false });

            if (quizzesError) throw quizzesError;

            //For each quiz, check if student has submitted
            const quizzesWithSubmissions: QuizWithSubmission[] = await Promise.all(
                (quizzesData || []).map(async (quiz: any) => {
                    const { data: submission } = (await supabase
                        .from('submissions')
                        .select('id, status, grade, created_at')
                        .eq('quiz_id', quiz.id)
                        .eq('student_id', profile.id)
                        .single()) as any;

                    return {
                        id: quiz.id,
                        title: quiz.title,
                        code: quiz.code,
                        start_time: quiz.start_time,
                        duration_mins: quiz.duration_mins,
                        submission: submission || null
                    };
                })
            );

            setQuizzes(quizzesWithSubmissions);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-64"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
                    <p className="text-gray-600 mt-2">View and submit quizzes</p>
                </div>

                {/* Quizzes Grid */}
                {quizzes.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <FileX className="mx-auto h-16 w-16 text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No quizzes available</h3>
                        <p className="mt-2 text-gray-500">Check back later for new quizzes</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => {
                            const hasSubmitted = !!quiz.submission;
                            const isPending = quiz.submission?.status === 'pending';
                            const isGraded = quiz.submission?.status === 'graded';

                            return (
                                <div
                                    key={quiz.id}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                                >
                                    {/* Header */}
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                                            {quiz.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Code: {quiz.code}</p>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2 mb-4">
                                        {quiz.start_time && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                {new Date(quiz.start_time).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        )}

                                        {quiz.duration_mins && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                {quiz.duration_mins} minutes
                                            </div>
                                        )}
                                    </div>

                                    {/* Status & Action */}
                                    <div className="pt-4 border-t space-y-3">
                                        {!hasSubmitted ? (
                                            <>
                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                    Not Started
                                                </span>
                                                <Link
                                                    href={`/student/upload/${quiz.id}`}
                                                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                                >
                                                    Start Quiz
                                                </Link>
                                            </>
                                        ) : isPending ? (
                                            <>
                                                <div className="flex items-center text-sm">
                                                    <Clock className="h-4 w-4 text-orange-500 mr-2" />
                                                    <span className="text-orange-600 font-medium">Pending Grading</span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Submitted on {new Date(quiz.submission!.created_at).toLocaleDateString()}
                                                </p>
                                            </>
                                        ) : isGraded ? (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center text-sm">
                                                        <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                                                        <span className="text-green-600 font-medium">Graded</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {quiz.submission!.grade}<span className="text-sm text-gray-500">/10</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Submitted on {new Date(quiz.submission!.created_at).toLocaleDateString()}
                                                </p>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
