'use client';

import { useApp } from '@/context/AppContext';
import {
  User,
  CreditCard,
  FileText,
  BarChart3,
  MessageSquare,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Inbox,
  LogOut,
  X,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const studentNav = [
  { id: 'profile',    label: 'Profile',            icon: User },
  { id: 'fees',       label: 'Fee Management',      icon: CreditCard },
  { id: 'hallticket', label: 'Hall Ticket',          icon: FileText },
  { id: 'results',    label: 'Report Card',          icon: BarChart3 },
  { id: 'grievance',  label: 'Grievance Desk',       icon: MessageSquare },
  { id: 'classroom',  label: 'Classroom Resources',  icon: BookOpen },
];

const teacherNav = [
  { id: 'profile',   label: 'Profile',            icon: GraduationCap },
  { id: 'marks',     label: 'Marks Entry',         icon: ClipboardList },
  { id: 'inbox',     label: 'Admin Inbox',         icon: Inbox },
  { id: 'classroom', label: 'Classroom Resources', icon: BookOpen },
];

export default function Sidebar({ activeModule, onModuleChange, isOpen, onClose }: SidebarProps) {
  const { state, dispatch } = useApp();
  const user = state.currentUser;
  const isTeacher = user?.role === 'teacher';
  const navItems = isTeacher ? teacherNav : studentNav;

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';

  const userId = isTeacher
    ? (user as { facultyId: string }).facultyId
    : (user as { rollNo: string }).rollNo;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/';
  };

  const handleNav = (id: string) => {
    onModuleChange(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-64 z-30 flex flex-col',
          'bg-slate-900 border-r border-slate-800',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Presentify</span>
            </div>
            {/* Close on mobile */}
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role badge */}
          <div className="mt-3">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border',
                isTeacher
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25'
                  : 'bg-blue-500/15 text-blue-400 border-blue-500/25'
              )}
            >
              {isTeacher ? '🎓 Faculty Portal' : '📚 Student Portal'}
            </span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── User card at bottom ── */}
        <div className="flex-shrink-0 p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3">
            <div
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0',
                isTeacher ? 'bg-indigo-500' : 'bg-blue-500'
              )}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs font-mono truncate">{userId}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 hover:text-red-400 transition-colors shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
