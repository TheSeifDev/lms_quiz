"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, RefreshCw, Clock, Calendar, FileText } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CreateQuizPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [quizCode, setQuizCode] = useState("GENERATE");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [creating, setCreating] = useState(false);

  // Logic to generate a random 4-char code (e.g., A7B2)
  const generateCode = async () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 1, 0 to avoid confusion
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      let result = "";
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if code already exists
      const { data, error } = await supabase
        .from('quizzes')
        .select('id')
        .eq('code', result)
        .single();

      if (!data) {
        // Code is unique
        setQuizCode(result);
        return result;
      }

      attempts++;
    }

    toast.error('Failed to generate unique code. Please try again.');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      toast.error('Not authenticated');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (quizCode === 'GENERATE') {
      toast.error('Please generate a quiz code');
      return;
    }

    setCreating(true);

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title: title.trim(),
          code: quizCode,
          instructor_id: profile.id,
          start_time: startTime || null,
          duration_mins: duration ? parseInt(duration) : null,
        } as any)
        .select()
        .single<{ id: string; title: string; code: string }>();

      if (error) throw error;

      toast.success(`Quiz created successfully! Code: ${quizCode}`);

      // Refresh dashboard data and redirect to grading page
      router.refresh();
      setTimeout(() => {
        router.push(`/doctor/grading/${data.id}`);
      }, 1000);

    } catch (error: any) {
      console.error('=== Quiz Creation Error ===');
      console.error('Error object:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Profile ID:', profile?.id);
      console.error('Profile:', profile);

      if (error.code === '23505') {
        // Unique constraint violation
        toast.error('Quiz code already exists. Please generate a new one.');
        setQuizCode('GENERATE');
      } else if (error.code === '23503') {
        // Foreign key violation - profile doesn't exist in database
        toast.error('⚠️ Profile not found in database. Please run the dev_setup.sql script in Supabase!');
      } else {
        toast.error(error?.message || 'Failed to create quiz. Check browser console for details.');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
        <p className="text-gray-500">Set up a new session for your students.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">

        {/* 1. Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="e.g. Cybersecurity Midterm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full pl-10 p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* The Magic Code Generator */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Access Code <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center font-mono text-xl font-bold tracking-widest text-blue-600">
                {quizCode}
              </div>
              <button
                type="button"
                onClick={generateCode}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-xs text-gray-500">Students will use this code to join the quiz.</p>
          </div>
        </div>

        {/* 2. Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Start Time</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-10 p-2.5 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Duration (Minutes)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="number"
                placeholder="60"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full pl-10 p-2.5 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={creating || !title.trim() || quizCode === 'GENERATE'}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Quiz...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Publish Quiz</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}