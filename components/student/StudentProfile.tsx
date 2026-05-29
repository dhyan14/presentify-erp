'use client';

import { useApp, StudentUser } from '@/context/AppContext';
import { MOCK_ATTENDANCE } from '@/lib/mockData';
import {
  Mail, Phone, MapPin, Calendar, Droplets,
  Shield, Wifi, Award, BookOpen, CheckCircle2, XCircle,
} from 'lucide-react';

export default function StudentProfile() {
  const { state } = useApp();
  const student = state.currentUser as StudentUser;
  const att     = MOCK_ATTENDANCE[student.rollNo as keyof typeof MOCK_ATTENDANCE];

  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const dob = new Date(student.dob).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* ── Profile header card (no banner) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-violet-200 shrink-0">
            {initials}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900">{student.name}</h1>
            <p className="text-slate-400 mt-0.5 text-sm">{student.branch}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                ● {student.enrollmentStatus}
              </span>
              <span className="text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
                Sem {student.semester} · Batch {student.batch}
              </span>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full">
                Section {student.section}
              </span>
            </div>
          </div>

          {/* Biometric key */}
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl border border-slate-700 shrink-0">
            <Shield className="w-4 h-4 text-violet-400 shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                Biometric Key (Face ID)
              </p>
              <p className="text-violet-400 font-mono font-bold text-base">{student.faceId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Roll Number',       value: student.rollNo,                  icon: Award,         color: 'violet' },
          { label: 'Admission Year',    value: student.admissionYear.toString(), icon: Calendar,      color: 'indigo' },
          { label: 'Section',           value: `Section ${student.section}`,    icon: BookOpen,      color: 'blue' },
          {
            label: 'Overall Attendance',
            value: `${att.overall}%`,
            icon: att.overall >= 75 ? CheckCircle2 : XCircle,
            color: att.overall >= 75 ? 'emerald' : 'red',
          },
        ].map((s) => {
          const Icon = s.icon;
          const styles: Record<string, { border: string; iconBg: string; iconText: string; valText: string }> = {
            violet:  { border: 'border-violet-100', iconBg: 'bg-violet-50 border-violet-200', iconText: 'text-violet-600', valText: 'text-violet-700' },
            indigo:  { border: 'border-indigo-100', iconBg: 'bg-indigo-50 border-indigo-200', iconText: 'text-indigo-600', valText: 'text-indigo-700' },
            blue:    { border: 'border-blue-100',   iconBg: 'bg-blue-50 border-blue-200',     iconText: 'text-blue-600',   valText: 'text-blue-700' },
            emerald: { border: 'border-emerald-100',iconBg: 'bg-emerald-50 border-emerald-200',iconText: 'text-emerald-600',valText: 'text-emerald-700' },
            red:     { border: 'border-red-100',    iconBg: 'bg-red-50 border-red-200',       iconText: 'text-red-500',    valText: 'text-red-600' },
          };
          const c = styles[s.color];
          return (
            <div key={s.label} className={`bg-white rounded-xl border ${c.border} p-5`}>
              <div className={`w-9 h-9 rounded-lg border ${c.iconBg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${c.iconText}`} />
              </div>
              <p className="text-slate-400 text-xs mb-1">{s.label}</p>
              <p className={`font-extrabold text-lg ${c.valText}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Two-column info ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-violet-500" /> Personal Information
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Email',         value: student.email,        Icon: Mail },
              { label: 'Phone',         value: student.phone,        Icon: Phone },
              { label: 'Date of Birth', value: dob,                  Icon: Calendar },
              { label: 'Blood Group',   value: student.bloodGroup,   Icon: Droplets },
              { label: 'Address',       value: student.address,      Icon: MapPin },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="flex items-start gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">{label}</p>
                  <p className="text-slate-900 text-sm font-semibold mt-0.5 break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Wifi className="w-4 h-4 text-violet-500" /> Subject-wise Attendance
          </h3>

          <div className="space-y-3">
            {att.subjects.map((sub) => {
              const ok = sub.percentage >= 75;
              return (
                <div key={sub.code}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-700 font-semibold truncate max-w-[60%]">{sub.name}</span>
                    <span className={`font-bold ${ok ? 'text-emerald-600' : 'text-red-500'}`}>
                      {sub.percentage.toFixed(1)}% ({sub.attended}/{sub.conducted})
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${ok ? 'bg-emerald-500' : 'bg-red-400'}`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-3">
              Recent Biometric Log (FaceID)
            </h4>
            <div className="space-y-2">
              {att.faceAttendanceLog.map((log, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg text-xs">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'Present' ? 'bg-emerald-500' : 'bg-red-400'}`}
                  />
                  <span className="text-slate-700 font-semibold">{log.subject}</span>
                  <span className="text-slate-400 flex-1">{log.date} · {log.time}</span>
                  {log.status === 'Present' ? (
                    <span className="text-emerald-500 font-mono font-bold">{log.confidence}%</span>
                  ) : (
                    <span className="text-red-400 font-medium">Absent</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
