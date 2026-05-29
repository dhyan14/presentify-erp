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
      {/* ── Profile hero ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(255,255,255,.15) 12px,rgba(255,255,255,.15) 24px)' }}
          />
        </div>

        <div className="px-6 md:px-8 pb-8 -mt-14">
          <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl mb-4 flex items-center justify-center">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold">
              {initials}
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{teacher.name}</h1>
              <p className="text-slate-500 mt-1 text-sm">{teacher.designation}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">
                  {teacher.department}
                </span>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                  ● Active Faculty
                </span>
              </div>
            </div>

            <div className="bg-slate-900 text-white px-5 py-3 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Faculty ID</p>
              <p className="text-indigo-400 font-mono font-bold text-lg">{teacher.facultyId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Joining Year',  value: teacher.joiningYear.toString(), icon: Award,        color: 'indigo' },
          { label: 'Cabin / Room',  value: teacher.cabinNo,               icon: MapPin,        color: 'blue' },
          { label: 'Classes',       value: teacher.assignedClasses.length.toString(), icon: Users, color: 'emerald' },
          { label: 'Subjects',      value: teacher.assignedSubjects.length.toString(), icon: BookOpen, color: 'violet' },
        ].map((s) => {
          const Icon = s.icon;
          const colorMap: Record<string, string> = {
            indigo:  'bg-indigo-50 border-indigo-200 text-indigo-600',
            blue:    'bg-blue-50 border-blue-200 text-blue-600',
            emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
            violet:  'bg-violet-50 border-violet-200 text-violet-600',
          };
          const c = colorMap[s.color];
          return (
            <div key={s.label} className={`bg-white rounded-xl border ${c.split(' ')[1]} p-5`}>
              <div className={`w-9 h-9 rounded-lg border ${c} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-slate-400 text-xs mb-1">{s.label}</p>
              <p className={`font-extrabold text-xl ${c.split(' ')[2]}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 text-sm mb-5 flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-500" /> Contact & Profile
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
              <Award className="w-4 h-4 text-indigo-500" /> Academic Qualifications
            </h3>
            <div className="space-y-2">
              {teacher.qualifications.map((q, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-slate-800 text-sm font-medium">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned classes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Assigned Classes
            </h3>
            <div className="space-y-2">
              {teacher.assignedClasses.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl">
                  <div>
                    <p className="text-slate-900 text-sm font-semibold">{cls.label}</p>
                    <p className="text-slate-400 text-xs">{cls.id}</p>
                  </div>
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">
                    {cls.strength} students
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned subjects */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Teaching Subjects
            </h3>
            <div className="space-y-2">
              {teacher.assignedSubjects.map((sub) => (
                <div key={sub.code} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                  <span className="font-mono text-xs font-bold text-indigo-600 w-16 shrink-0">{sub.code}</span>
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
