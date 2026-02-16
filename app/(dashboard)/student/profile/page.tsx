import { Mail, Hash, BookOpen, Award, Clock } from "lucide-react";

// Mock Data
const STUDENT = {
  name: "Seif Ayman",
  id: "2521233",
  email: "seif@badr.edu.eg",
  program: "Information Technology",
  level: "First Year",
  stats: {
    avgGrade: "88%",
    quizzesTaken: 12,
    attendance: "95%"
  }
};

const HISTORY = [
  { id: 1, title: "C++ Basics", date: "2024-10-12", grade: "10/10", status: "graded" },
  { id: 2, title: "Network Security", date: "2024-10-15", grade: "-", status: "processing" },
  { id: 3, title: "Calculus II", date: "2024-10-10", grade: "4/10", status: "failed" },
];

// Helper Component for Badges
const StatusBadge = ({ status, grade }: { status: string, grade: string }) => {
  if (status === 'graded') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{grade} Excellent</span>;
  if (status === 'processing') return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Processing</span>;
  return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">{grade} Failed</span>;
};

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* 1. Top Section: Identity Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-linear-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
          {STUDENT.name[0]}
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">{STUDENT.name}</h1>
          <p className="text-gray-500">{STUDENT.program} • {STUDENT.level}</p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-2">
            <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
              <Hash size={14} /> {STUDENT.id}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
              <Mail size={14} /> {STUDENT.email}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><BookOpen /></div>
          <div>
            <p className="text-sm text-gray-500">Quizzes Taken</p>
            <p className="text-xl font-bold">{STUDENT.stats.quizzesTaken}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600"><Award /></div>
          <div>
            <p className="text-sm text-gray-500">Avg. Grade</p>
            <p className="text-xl font-bold">{STUDENT.stats.avgGrade}</p>
          </div>
        </div>
      </div>

      {/* 3. Recent History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-lg">Quiz History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Quiz Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {HISTORY.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4">{item.date}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} grade={item.grade} /></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:underline">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}