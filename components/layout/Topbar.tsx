'use client';

import { useApp } from '@/context/AppContext';
import { Menu, Bell } from 'lucide-react';
import clsx from 'clsx';

interface TopbarProps {
  activeModule: string;
  onMenuClick: () => void;
}

const MODULE_LABELS: Record<string, { title: string; subtitle: string }> = {
  profile:    { title: 'Profile',                   subtitle: 'Your academic profile & biometric details' },
  fees:       { title: 'Fee Management',             subtitle: 'View, pay & download fee receipts' },
  hallticket: { title: 'Eligibility & Hall Ticket',  subtitle: 'Check eligibility and generate exam hall ticket' },
  results:    { title: 'Report Card',                subtitle: 'Subject-wise grades, SPI & CPI' },
  grievance:  { title: 'Grievance Desk',             subtitle: 'Submit leave & certificate requests' },
  classroom:  { title: 'Classroom Resources',        subtitle: 'Google Classroom integration hub' },
  marks:      { title: 'Marks Entry',                subtitle: 'Input, edit & publish student marks' },
  inbox:      { title: 'Admin Inbox',                subtitle: 'Review & action student requests' },
};

export default function Topbar({ activeModule, onMenuClick }: TopbarProps) {
  const { state } = useApp();
  const user = state.currentUser;
  const isTeacher = user?.role === 'teacher';

  const info = MODULE_LABELS[activeModule] ?? { title: 'Dashboard', subtitle: '' };

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Count pending tickets for teacher notification badge
  const pendingCount = isTeacher
    ? state.tickets.filter((t) => t.status === 'submitted' || t.status === 'under_review').length
    : 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-10">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Module title + date */}
      <div className="flex-1 min-w-0">
        <h2 className="text-slate-900 font-bold text-base leading-none truncate">{info.title}</h2>
        <p className="text-slate-400 text-xs mt-0.5 hidden sm:block truncate">{info.subtitle}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Date pill — hidden on small screens */}
        <div className="hidden md:block text-right mr-2">
          <p className="text-slate-400 text-xs">{today}</p>
        </div>

        {/* Notification bell */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Avatar */}
        <div
          className={clsx(
            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-default select-none',
            isTeacher ? 'bg-indigo-500' : 'bg-blue-500'
          )}
          title={user?.name}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
