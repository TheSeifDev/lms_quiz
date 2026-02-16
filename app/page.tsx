"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Plus,
  Camera,
  CheckCircle2,
  Clock,
  Menu,
  Bell,
  X,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { DEV_MODE, DEMO_USERS, DEMO_QUIZ_IDS, type DemoRole } from "@/lib/demo-user";
import type { Quiz, Submission, SubmissionWithStudent } from "@/types";
import { CardSkeleton, ListSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DashboardPortal() {
  const { profile, loading: authLoading, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [quizCode, setQuizCode] = useState("");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingQuiz, setUpcomingQuiz] = useState<Quiz | null>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // DEV MODE: Local role override for testing
  const [devRole, setDevRole] = useState<DemoRole>('student');

  // Use dev role override if in dev mode
  const activeProfile = DEV_MODE ? DEMO_USERS[devRole] : profile;
  const isStudent = activeProfile?.role === 'student';
  const isDoctor = activeProfile?.role === 'doctor';

  // Fetch dashboard data based on role
  useEffect(() => {
    if (!profile) return;

    const fetchDashboardData = async () => {
      setLoadingData(true);
      try {
        if (profile.role === 'student') {
          await fetchStudentData();
        } else if (profile.role === 'doctor') {
          await fetchDoctorData();
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();
  }, [activeProfile, devRole]); // Re-fetch when role changes

  const fetchStudentData = async () => {
    if (!activeProfile) return;

    try {
      // Fetch total submissions count
      const { data: allSubmissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('id, status, grade, created_at, quizzes:quiz_id(title)')
        .eq('student_id', activeProfile.id);

      if (submissionsError) throw submissionsError;

      // Calculate stats
      const totalSubmissions = allSubmissions?.length || 0;
      const pendingSubmissions = allSubmissions?.filter((s: any) => s.status === 'pending').length || 0;
      const gradedSubmissions = allSubmissions?.filter((s: any) => s.status === 'graded').length || 0;
      const averageGrade = gradedSubmissions > 0
        ? (allSubmissions?.filter((s: any) => s.status === 'graded')
          .reduce((sum: number, s: any) => sum + (s.grade || 0), 0) / gradedSubmissions).toFixed(1)
        : '0';

      setStatsData({
        totalSubmissions,
        pendingSubmissions,
        gradedSubmissions,
        averageGrade
      });

      // Recent submissions (last 3)
      const recentSubmissions = allSubmissions
        ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3) || [];

      setRecentActivity(recentSubmissions);

      // Fetch upcoming quiz
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1);

      setUpcomingQuiz(quizzes?.[0] || null);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchDoctorData = async () => {
    if (!activeProfile) return;

    try {
      // Fetch all quizzes by this doctor
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, title, code, created_at, start_time')
        .eq('instructor_id', activeProfile.id)
        .order('created_at', { ascending: false });

      if (quizzesError) throw quizzesError;

      const totalQuizzes = quizzes?.length || 0;

      // Fetch all submissions for doctor's quizzes
      const { data: allSubmissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('*, quizzes!inner(instructor_id)')
        .eq('quizzes.instructor_id', activeProfile.id);

      if (submissionsError) throw submissionsError;

      const totalSubmissions = allSubmissions?.length || 0;
      const pendingSubmissions = allSubmissions?.filter((s: any) => s.status === 'pending').length || 0;
      const gradedSubmissions = allSubmissions?.filter((s: any) => s.status === 'graded').length || 0;

      setStatsData({
        totalQuizzes,
        totalSubmissions,
        pendingSubmissions,
        gradedSubmissions
      });

      // Recent quizzes (last 3)
      setRecentActivity(quizzes?.slice(0, 3) || []);

      // Find quiz with most ungraded submissions
      if (pendingSubmissions > 0 && allSubmissions) {
        const quizCounts: Record<string, number> = {};
        allSubmissions
          .filter((s: any) => s.status === 'pending')
          .forEach((sub: any) => {
            if (sub.quiz_id) {
              quizCounts[sub.quiz_id] = (quizCounts[sub.quiz_id] || 0) + 1;
            }
          });


        const topQuizId = Object.keys(quizCounts).sort((a, b) => quizCounts[b] - quizCounts[a])[0];
        if (topQuizId) {
          const quiz: any = quizzes?.find((q: any) => q.id === topQuizId);
          if (quiz) {
            setUpcomingQuiz({ ...quiz, ungradedCount: quizCounts[topQuizId] } as any);
          }
        }
      } else if (quizzes && quizzes.length > 0) {
        // Show most recent quiz if no pending submissions
        setUpcomingQuiz(quizzes[0]);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleJoinQuiz = async () => {
    if (!quizCode.trim()) {
      toast.error('Please enter a quiz code');
      return;
    }

    try {
      const { data: quiz, error } = await supabase
        .from('quizzes')
        .select('id')
        .eq('code', quizCode.toUpperCase())
        .single<{ id: string }>();

      if (error || !quiz) {
        toast.error('Invalid quiz code');
        return;
      }

      // Redirect to upload page
      window.location.href = `/student/upload/${quiz.id}`;
    } catch (error) {
      toast.error('Failed to join quiz');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (authLoading && !DEV_MODE) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">

      {/* Join Quiz Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Join Quiz</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Enter the 4-character code provided by your instructor</p>
            <input
              type="text"
              maxLength={4}
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
              placeholder="XXXX"
              className="w-full p-3 border rounded-lg text-center text-2xl font-mono font-bold tracking-widest uppercase mb-4"
            />
            <button
              onClick={handleJoinQuiz}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
            >
              Join Quiz
            </button>
          </div>
        </div>
      )}

      {/* ==================== 1. SIDEBAR ==================== */}
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        flex flex-col
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="font-bold text-xl tracking-tight text-gray-800">Uni<span className="text-blue-600">LMS</span></span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {isStudent && (
            <>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-4">Student</div>
              <Link href="/">
                <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
              </Link>
              <button onClick={() => setShowJoinModal(true)} className="w-full text-left">
                <NavItem icon={<Camera size={20} />} label="Join Quiz" />
              </button>
              <Link href="/student/quizzes">
                <NavItem icon={<FileText size={20} />} label="My Quizzes" />
              </Link>
              <Link href="/profile">
                <NavItem icon={<GraduationCap size={20} />} label="Profile" />
              </Link>
            </>
          )}

          {isDoctor && (
            <>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-4">Instructor</div>
              <Link href="/">
                <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
              </Link>
              <Link href="/doctor/create-quiz">
                <NavItem icon={<Plus size={20} />} label="Create Quiz" />
              </Link>
              <Link href="/doctor/grading">
                <NavItem icon={<CheckCircle2 size={20} />} label="Grading" />
              </Link>
            </>
          )}

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-8">System</div>
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        {/* User Profile Snippet (Bottom Sidebar) */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">ID: {profile.academic_id || 'N/A'}</p>
            </div>
            <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>


      {/* ==================== 2. MAIN CONTENT AREA ==================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8">
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex flex-col">
            <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
            <p className="text-xs text-gray-500">Welcome back, {activeProfile?.full_name?.split(' ')[0] || 'User'}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* DEV MODE SWITCHER */}
            {DEV_MODE && (
              <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 px-3 py-1 rounded-lg">
                <span className="text-xs font-bold text-yellow-800">DEV MODE:</span>
                <button
                  onClick={() => setDevRole('student')}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition ${devRole === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Student
                </button>
                <button
                  onClick={() => setDevRole('doctor')}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition ${devRole === 'doctor'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Doctor
                </button>
              </div>
            )}

            <button className="relative p-2 text-gray-400 hover:text-blue-600 transition">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>


        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-8">

          {/* SECTION A: QUICK ACTIONS (The Portal) */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {isStudent && (
                <>
                  {/* Card 1: Student Upload */}
                  <button onClick={() => setShowJoinModal(true)} className="group text-left">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition cursor-pointer h-full">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <Camera size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900">Join Quiz</h3>
                      <p className="text-sm text-gray-500 mt-1">Enter code & upload answer sheet.</p>
                    </div>
                  </button>

                  {/* Card 2: Student Profile */}
                  <Link href="/student/profile" className="group">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-500 hover:shadow-md transition cursor-pointer h-full">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <GraduationCap size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900">My Profile</h3>
                      <p className="text-sm text-gray-500 mt-1">View stats, grades and history.</p>
                    </div>
                  </Link>
                </>
              )}

              {isDoctor && (
                <>
                  {/* Card 3: Doctor Create */}
                  <Link href="/doctor/create-quiz" className="group">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-green-500 hover:shadow-md transition cursor-pointer h-full">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <Plus size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900">Create Quiz</h3>
                      <p className="text-sm text-gray-500 mt-1">Generate new code for students.</p>
                    </div>
                  </Link>

                  {/* Card 4: Doctor Grading */}
                  {upcomingQuiz && (
                    <Link href={`/doctor/grading/${upcomingQuiz.id}`} className="group">
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition cursor-pointer h-full">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                          <CheckCircle2 size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900">Grading</h3>
                        <p className="text-sm text-gray-500 mt-1">Review pending submissions.</p>
                      </div>
                    </Link>
                  )}
                </>
              )}

            </div>
          </section>


          {/* SECTION B: STATS OVERVIEW */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-800">Recent Activity</h2>
                <button className="text-sm text-blue-600 hover:underline">View All</button>
              </div>

              {loadingData ? (
                <ListSkeleton count={3} />
              ) : (
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
                  ) : (
                    recentActivity.map((item: any, i) => (
                      <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-4">
                          {isStudent ? 'QZ' : item.title?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {isStudent ? item.quizzes?.title : item.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {isStudent
                              ? `Submitted ${new Date(item.created_at).toLocaleDateString()}`
                              : `Created ${new Date(item.created_at).toLocaleDateString()}`
                            }
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${isStudent
                          ? item.status === 'graded'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {isStudent ? (item.status === 'graded' ? `${item.grade}/10` : 'Pending') : `Code: ${item.code}`}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Upcoming / Mini Stats */}
            <div className="space-y-6">
              {/* Upcoming Quiz Card */}
              {loadingData ? (
                <CardSkeleton />
              ) : upcomingQuiz ? (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-2 opacity-80 mb-1">
                    <Clock size={16} />
                    <span className="text-xs font-medium uppercase tracking-wider">
                      {isStudent ? 'Next Quiz' : 'Most Pending'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{upcomingQuiz.title}</h3>
                  <p className="text-blue-100 text-sm mb-4">
                    {isStudent
                      ? upcomingQuiz.start_time
                        ? new Date(upcomingQuiz.start_time).toLocaleString()
                        : 'No date set'
                      : statsData?.ungradedCount
                        ? `${statsData.ungradedCount} ungraded submission${statsData.ungradedCount > 1 ? 's' : ''}`
                        : 'No pending submissions'
                    }
                  </p>
                  {upcomingQuiz.duration_mins && (
                    <p className="text-xs mt-2 text-blue-100">Duration: {upcomingQuiz.duration_mins} minutes</p>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <p className="text-sm text-gray-500 text-center">No upcoming quizzes</p>
                </div>
              )}

              {/* Stats Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-2">
                  {isStudent ? 'Semester Progress' : 'Active Quizzes'}
                </h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {isStudent ? '85%' : recentActivity.length}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">
                    {isStudent ? 'completed' : 'total'}
                  </span>
                </div>
              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}

// --- Helper Component for Sidebar Items ---
function NavItem({ icon, label, active = false }: { icon: ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`
      flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group
      ${active ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
    `}>
      <div className={active ? "text-blue-600" : "group-hover:text-gray-900 transition"}>
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}