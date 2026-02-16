"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadCard from "@/components/quiz/UploadCard";
import { Calendar, Hash, Users, Layers } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import type { Quiz } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ quizId: string }>;
}

export default function QuizUploadPage({ params }: PageProps) {
  // Unwrap async params for Next.js 16
  const { quizId } = use(params);
  const { profile } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();

        if (error) throw error;
        setQuiz(data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Quiz not found');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchQuiz();
    }
  }, [quizId, profile, router]);

  const handleImageSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleSubmit = async () => {
    // Validation checks
    if (!profile) {
      toast.error('User profile not loaded');
      console.error('Missing profile:', profile);
      return;
    }

    if (!quiz) {
      toast.error('Quiz not found');
      console.error('Missing quiz:', quiz);
      return;
    }

    if (!uploadedFile) {
      toast.error('Please select an image to upload');
      return;
    }

    // Verify IDs are valid
    console.log('=== Starting Submission ===');
    console.log('Quiz ID:', quiz.id);
    console.log('Student ID:', profile.id);
    console.log('File:', uploadedFile.name);

    setUploading(true);

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${quiz.id}/${profile.id}/${Date.now()}.${fileExt}`;

      console.log('Uploading to storage:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('quiz-submissions')
        .upload(fileName, uploadedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('=== Storage Upload Error ===');
        console.error('Error code:', uploadError.message);
        console.error('Full error:', JSON.stringify(uploadError, null, 2));
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('quiz-submissions')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // 3. Create submission record
      const submissionData = {
        quiz_id: quiz.id,
        student_id: profile.id,
        image_url: publicUrl,
        status: 'pending' as const
      };

      console.log('Inserting submission:', submissionData);

      const { data: insertData, error: insertError } = await supabase
        .from('submissions')
        .insert(submissionData as any) // Type assertion to bypass strict type checking
        .select()
        .single<{ id: string; quiz_id: string; student_id: string }>();

      if (insertError) {
        console.error('=== Database Insert Error ===');
        console.error('Error code:', insertError.code);
        console.error('Error message:', insertError.message);
        console.error('Error details:', insertError.details);
        console.error('Error hint:', insertError.hint);
        console.error('Full error:', JSON.stringify(insertError, null, 2));
        throw insertError;
      }

      console.log('Submission created:', insertData);
      toast.success('Quiz submitted successfully!');

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (error: any) {
      console.error('=== Submission Error ===');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
      console.error('Full error (stringified):', JSON.stringify(error, null, 2));

      // User-friendly error messages based on error codes
      if (error?.code === '23503') {
        toast.error('⚠️ Database reference error. Please ensure you ran the dev_setup.sql script!');
      } else if (error?.code === '42501') {
        toast.error('⚠️ Permission denied. Check Row Level Security (RLS) policies in Supabase.');
      } else if (error?.message?.includes('storage')) {
        toast.error('Failed to upload image. Check if quiz-submissions bucket exists.');
      } else {
        toast.error(error?.message || 'Failed to submit quiz. Check console for details.');
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* 1. Header & Student Info */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-blue-100 flex items-center justify-center text-white text-2xl font-bold">
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{profile?.full_name || 'Student'}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                  ID: {profile?.academic_id || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 2. Quiz Metadata */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Layers size={20} className="text-blue-600" />
            Quiz Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quiz Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Quiz Name</label>
              <input
                type="text"
                value={quiz.title}
                className="w-full p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                readOnly
              />
            </div>

            {/* Quiz Code */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Quiz Code</label>
              <input
                type="text"
                value={quiz.code}
                className="w-full p-2 bg-gray-50 border rounded-lg text-center font-mono font-bold tracking-widest"
                readOnly
              />
            </div>

            {/* Start Time */}
            {quiz.start_time && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Start Time</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={new Date(quiz.start_time).toLocaleString()}
                    className="w-full p-2 pl-9 bg-gray-50 border rounded-lg"
                    readOnly
                  />
                </div>
              </div>
            )}

            {/* Duration */}
            {quiz.duration_mins && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Duration</label>
                <input
                  type="text"
                  value={`${quiz.duration_mins} minutes`}
                  className="w-full p-2 bg-gray-50 border rounded-lg"
                  readOnly
                />
              </div>
            )}
          </div>
        </section>

        {/* 3. Upload Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Answer Sheet</h2>
          <UploadCard onImageSelect={handleImageSelect} />
        </section>

        {/* 4. Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!uploadedFile || uploading}
          className={`w-full py-3 font-bold rounded-xl shadow-lg transition active:scale-[0.98] ${!uploadedFile || uploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
            }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </span>
          ) : (
            'Submit Quiz'
          )}
        </button>

      </div>
    </div>
  );
}