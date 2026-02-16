"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Clock, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface QuizWithStats {
    id: string;
    title: string;
    code: string;
    start_time: string | null;
    duration_mins: number | null;
    pendingCount: number;
    totalCount: number;
}

export default function DoctorGradingListPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<QuizWithStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile || profile.role !== 'doctor') {
            router.push('/');
            return;
        }

        fetchQuizzes();
    }, [profile, router]);

    const fetchQuizzes = async () => {
        if (!profile) return;

        try {
            setLoading(true);

            // Fetch all quizzes by this doctor
            const { data: quizzesData, error: quizzesError } = await supabase
                .from('quizzes')
                .select('id, title, code, start_time, duration_mins')
                .eq('instructor_id', profile.id)
                .order('created_at', { ascending: false });

            if (quizzesError) throw quizzesError;


            // For each quiz, count submissions
            const quizzesWithStats: QuizWithStats[] = await Promise.all(
                (quizzesData || []).map(async (quiz: any) => {
                    const { data: submissions } = (await supabase
                        .from('submissions')
                        .select('id, status')
                        .eq('quiz_id', quiz.id)) as any;

                    const pendingCount = submissions?.filter((s: any) => s.status === 'pending').length || 0;
                    const totalCount = submissions?.length || 0;

                    return {
                        id: quiz.id,
                        title: quiz.title,
                        code: quiz.code,
                        start_time: quiz.start_time,
                        duration_mins: quiz.duration_mins,
                        pendingCount,
                        totalCount
                    };
                })
            );
            setQuizzes(quizzesWithStats);
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
                    <h1 className="text-3xl font-bold text-gray-900">Quiz Grading</h1>
                    <p className="text-gray-600 mt-2">Select a quiz to grade submissions</p>
                </div>

                {/* Quizzes Grid */}
                {quizzes.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <FileText className="mx-auto h-16 w-16 text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No quizzes yet</h3>
                        <p className="mt-2 text-gray-500">Create your first quiz to get started</p>
                        <Link
                            href="/doctor/create-quiz"
                            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Create Quiz
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <Link
                                key={quiz.id}
                                href={`/doctor/grading/${quiz.id}`}
                                className="block group"
                            >
                                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 hover:border-blue-200">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                                                {quiz.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">Code: {quiz.code}</p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-gray-600">
                                                {quiz.totalCount} submission{quiz.totalCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        {quiz.pendingCount > 0 && (
                                            <div className="flex items-center text-sm">
                                                <Clock className="h-4 w-4 text-orange-500 mr-2" />
                                                <span className="text-orange-600 font-medium">
                                                    {quiz.pendingCount} pending
                                                </span>
                                            </div>
                                        )}

                                        {quiz.start_time && (
                                            <div className="text-xs text-gray-500 pt-2 border-t">
                                                {new Date(quiz.start_time).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Badge */}
                                    {quiz.pendingCount > 0 ? (
                                        <div className="mt-4 pt-4 border-t">
                                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                                Needs Grading
                                            </span>
                                        </div>
                                    ) : quiz.totalCount > 0 ? (
                                        <div className="mt-4 pt-4 border-t">
                                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                All Graded
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-4 pt-4 border-t">
                                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                No Submissions
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
