'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import StudentProfile from '@/components/student/StudentProfile';
import FeeManagement from '@/components/student/FeeManagement';
import HallTicket from '@/components/student/HallTicket';
import ReportCard from '@/components/student/ReportCard';
import GrievanceDesk from '@/components/student/GrievanceDesk';
import TeacherProfile from '@/components/teacher/TeacherProfile';
import MarksEntry from '@/components/teacher/MarksEntry';
import AdminInbox from '@/components/teacher/AdminInbox';
import ClassroomHub from '@/components/shared/ClassroomHub';

type StudentModule = 'profile' | 'fees' | 'hallticket' | 'results' | 'grievance' | 'classroom';
type TeacherModule = 'profile' | 'marks' | 'inbox' | 'classroom';
type AnyModule = StudentModule | TeacherModule;

export default function DashboardPage() {
  const router = useRouter();
  const { state } = useApp();
  const [activeModule, setActiveModule] = useState<AnyModule>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !state.currentUser) {
      router.replace('/');
    }
  }, [mounted, state.currentUser, router]);

  if (!mounted || !state.currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-slate-400 text-sm">Loading your portal…</p>
        </div>
      </div>
    );
  }

  const isTeacher = state.currentUser.role === 'teacher';

  const renderModule = () => {
    if (isTeacher) {
      switch (activeModule) {
        case 'profile':   return <TeacherProfile />;
        case 'marks':     return <MarksEntry />;
        case 'inbox':     return <AdminInbox />;
        case 'classroom': return <ClassroomHub />;
        default:          return <TeacherProfile />;
      }
    }
    switch (activeModule) {
      case 'profile':    return <StudentProfile />;
      case 'fees':       return <FeeManagement />;
      case 'hallticket': return <HallTicket />;
      case 'results':    return <ReportCard />;
      case 'grievance':  return <GrievanceDesk />;
      case 'classroom':  return <ClassroomHub />;
      default:           return <StudentProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={(m) => setActiveModule(m as AnyModule)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content shifts right on large screens to avoid sidebar overlap */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <Topbar
          activeModule={activeModule}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {/* Key on activeModule forces unmount/remount for animation */}
          <div key={activeModule} className="animate-fade-in">
            {renderModule()}
          </div>
        </main>

        <footer className="text-center py-4 text-slate-300 text-xs border-t border-slate-100 bg-white">
          Presentify Academic ERP — Phase 1 · Demo Environment · © 2026
        </footer>
      </div>
    </div>
  );
}
