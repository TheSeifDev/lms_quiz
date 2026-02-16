"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import type { SubmissionWithStudent } from "@/types";
import { toast } from "sonner";
import { ListSkeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface PageProps {
  params: Promise<{ quizId: string }>;
}

export default function GradingPage({ params }: PageProps) {
  // Unwrap async params for Next.js 16
  const { quizId } = use(params);
  const { profile } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const currentSubmission = submissions[selectedIndex];

  useEffect(() => {
    fetchSubmissions();
  }, [quizId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          student:profiles!student_id (
            id,
            full_name,
            academic_id,
            avatar_url
          )
        `)
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);

      // Set initial grade and feedback if viewing graded submission
      if (data && data.length > 0 && (data[0] as any).grade !== null) {
        setGrade((data[0] as any).grade.toString());
        setFeedback((data[0] as any).feedback || '');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!currentSubmission) return;

    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
      toast.error('Grade must be between 0 and 10');
      return;
    }


    setSaving(true);
    try {
      const updateData: any = {
        grade: gradeNum,
        status: 'graded',
        feedback: feedback || null
      };

      // Cast to any to bypass TypeScript strict type checking for Vercel build
      const { error } = await (supabase as any)
        .from('submissions')
        .update(updateData)
        .eq('id', currentSubmission.id);

      if (error) throw error;


      toast.success('Grade saved successfully!');

      // Refresh dashboard data
      router.refresh();

      // Update local state
      const updatedSubmissions = [...submissions];
      updatedSubmissions[selectedIndex] = {
        ...currentSubmission,
        grade: gradeNum,
        status: 'graded',
        feedback: feedback || null
      };
      setSubmissions(updatedSubmissions);

      // Move to next submission if available
      if (selectedIndex < submissions.length - 1) {
        const nextIndex = selectedIndex + 1;
        setSelectedIndex(nextIndex);
        setGrade(updatedSubmissions[nextIndex].grade?.toString() || '');
        setFeedback(updatedSubmissions[nextIndex].feedback || '');
      }

    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSubmission = (index: number) => {
    setSelectedIndex(index);
    const submission = submissions[index];
    setGrade(submission.grade?.toString() || '');
    setFeedback(submission.feedback || '');
  };

  const handleNext = () => {
    if (selectedIndex < submissions.length - 1) {
      handleSelectSubmission(selectedIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      handleSelectSubmission(selectedIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-gray-50">
        <aside className="w-full md:w-80 bg-white border-r border-gray-200 p-4">
          <ListSkeleton count={5} />
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-gray-50">

      {/* LEFT: Student List Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="font-bold text-gray-800">Submissions</h2>
          <p className="text-xs text-gray-500">Quiz ID: {quizId.substring(0, 8)}...</p>
          <p className="text-xs text-gray-600 mt-1">
            {submissions.filter(s => s.status === 'graded').length} / {submissions.length} graded
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {submissions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No submissions yet</p>
            </div>
          ) : (
            submissions.map((sub, index) => (
              <div
                key={sub.id}
                onClick={() => handleSelectSubmission(index)}
                className={`p-4 border-b cursor-pointer transition hover:bg-gray-50 ${selectedIndex === index ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {sub.student?.full_name || 'Unknown Student'}
                    </p>
                    <p className="text-xs text-gray-500">{sub.student?.academic_id || 'N/A'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {sub.status === 'graded' ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                      {sub.grade}/10
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* RIGHT: Grading Area */}
      <main className="flex-1 flex flex-col h-full">
        {currentSubmission ? (
          <>
            {/* Toolbar */}
            <div className="h-16 bg-white border-b flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={selectedIndex === 0}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="font-semibold">
                  {currentSubmission.student?.full_name || 'Unknown'}&apos;s Paper
                </h3>
                <button
                  onClick={handleNext}
                  disabled={selectedIndex === submissions.length - 1}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={10}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-16 p-2 border rounded text-center font-bold"
                />
                <span className="text-gray-500">/ 10</span>
                <button
                  onClick={handleSaveGrade}
                  disabled={saving || !grade}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {saving ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-white border-b px-6 py-3">
              <textarea
                placeholder="Add feedback (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            {/* Image Viewer Canvas */}
            <div className="flex-1 bg-gray-100 p-8 overflow-auto flex items-center justify-center">
              <div className="relative shadow-2xl max-w-4xl w-full bg-white rounded-lg overflow-hidden">
                {currentSubmission.image_url ? (
                  <div className="relative w-full" style={{ minHeight: '600px' }}>
                    <img
                      src={currentSubmission.image_url}
                      alt="Submission"
                      className="w-full h-auto"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center text-gray-400">
                    [ No Image Available ]
                  </div>
                )}
              </div>
            </div>
            {/* Back Button */}
            <div className="mt-4">
              <Link
                href={`/doctor/grading/${quizId}`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back to Quiz
              </Link>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No submission selected</p>
          </div>
        )}
      </main>
    </div>
  );
}