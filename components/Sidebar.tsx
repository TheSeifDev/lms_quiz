"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, History, Settings, LogOut, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have the utils file from before

const MENU_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Take Quiz", href: "/quiz/upload", icon: Camera },
  { name: "My History", href: "/profile", icon: History },
  { name: "Create Quiz", href: "/doctor/create", icon: PlusCircle, role: "doctor" }, // Demo: Doctor link
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-gray-900 text-white border-r border-gray-800 sticky top-0">
      {/* 1. Logo Area */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Uni<span className="text-white">LMS</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Student Portal</p>
      </div>

      {/* 2. Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. User & Logout */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition">
          <Settings size={20} />
          <span className="font-medium text-sm">Settings</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-900/20 rounded-xl transition">
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}