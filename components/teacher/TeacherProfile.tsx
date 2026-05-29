'use client';

import { useApp, TeacherUser } from '@/context/AppContext';
import {
  Mail, Phone, MapPin, Briefcase, BookOpen, Users, GraduationCap, Award,
} from 'lucide-react';

export default function TeacherProfile() {
  const { state } = useApp();
  const teacher = state.currentUser as TeacherUser;

  const initials = teacher.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* ── Profile header card (no banner) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-violet-200 shrink-0">
            {initials}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900">{teacher.name}</h1>
            <p className="text-slate-400 mt-0.5 text-sm">{teacher.designation}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
                {teacher.department}
              </span>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                ● Active Faculty
              </span>
            </div>
          </div>

          {/* Faculty ID badge */}
          <div className="bg-slate-900 text-white px-5 py-3 rounded-xl border border-slate-700 shrink-0">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Faculty ID</p>
            <p className="text-violet-400 font-mono font-bold text-lg">{teacher.facultyId}</p>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Joining Year', value: teacher.joiningYear.toString(),          icon: Award,        color: 'violet' },
          { label: 'Cabin / Room', value: teacher.cabinNo,                         icon: MapPin,       color: 'blue' },
          { label: 'Classes',      value: teacher.assignedClasses.length.toString(), icon: Users,       color: 'emerald' },
          { label: 'Subjects',     value: teacher.assignedSubjects.length.toString(), icon: BookOpen,  color: 'indigo' },
        ].map((s) => {
          const Icon = s.icon;
          const styles: Record<string, { border: string; iconBg: string; iconText: string; valText: string }> = {
            violet:  { border: 'border-violet-100', iconBg: 'bg-violet-50 border-violet-200', iconText: 'text-violet-600', valText: 'text-violet-700' },
            blue:    { border: 'border-blue-100',   iconBg: 'bg-blue-50 border-blue-200',     iconText: 'text-blue-600',   valText: 'text-blue-700' },
            emerald: { border: 'border-emerald-100',iconBg: 'bg-emerald-50 border-emerald-200',iconText: 'text-emerald-600',valText: 'text-emerald-700' },
            indigo:  { border: 'border-indigo-100', iconBg: 'bg-indigo-50 border-indigo-200', iconText: 'text-indigo-600', valText: 'text-indigo-700' },
          };
          const c = styles[s.color];
          return (
            <div key={s.label} className={`bg-white rounded-xl border ${c.border} p-5`}>
              <div className={`w-9 h-9 rounded-lg border ${c.iconBg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${c.iconText}`} />
              </div>
              <p className="text-slate-400 text-xs mb-1">{s.label}</p>
              <p className={`font-extrabold text-xl ${c.valText}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-5 flex items-center gap-2">
            <Mail className="w-4 h-4 text-violet-500" /> Contact &amp; Profile
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Email',       value: teacher.email,       Icon: Mail },
              { label: 'Phone',       value: teacher.phone,       Icon: Phone },
              { label: 'Cabin',       value: teacher.cabinNo,     Icon: MapPin },
              { label: 'Department',  value: teacher.department,  Icon: Briefcase },
              { label: 'Designation', value: teacher.designation, Icon: GraduationCap },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="flex items-start gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">{label}</p>
                  <p className="text-slate-900 text-sm font-semibold mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Qualifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-500" /> Academic Qualifications
            </h3>
            <div className="space-y-2">
              {teacher.qualifications.map((q, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-slate-800 text-sm font-medium">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Classes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" /> Assigned Classes
            </h3>
            <div className="space-y-2">
              {teacher.assignedClasses.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl">
                  <div>
                    <p className="text-slate-900 text-sm font-semibold">{cls.label}</p>
                    <p className="text-slate-400 text-xs">{cls.id}</p>
                  </div>
                  <span className="text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
                    {cls.strength} students
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-500" /> Teaching Subjects
            </h3>
            <div className="space-y-2">
              {teacher.assignedSubjects.map((sub) => (
                <div key={sub.code} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                  <span className="font-mono text-xs font-bold text-violet-600 w-16 shrink-0">{sub.code}</span>
                  <div className="flex-1">
                    <p className="text-slate-900 text-sm font-semibold">{sub.name}</p>
                    <p className="text-slate-400 text-xs">Sem {sub.semester} · Batch {sub.batch}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
