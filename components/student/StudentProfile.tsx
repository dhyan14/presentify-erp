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
  const att = MOCK_ATTENDANCE[student.rollNo as keyof typeof MOCK_ATTENDANCE];

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
      {/* ── Profile hero card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="h-36 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.15) 12px, rgba(255,255,255,0.15) 24px)',
            }}
          />
        </div>

        <div className="px-6 md:px-8 pb-8 -mt-14">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl mb-4 flex items-center justify-center">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold">
              {initials}
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{student.name}</h1>
              <p className="text-slate-500 mt-1 text-sm">{student.branch}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                  ● {student.enrollmentStatus}
                </span>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                  Sem {student.semester} &middot; Batch {student.batch}
                </span>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full">
                  Section {student.section}
                </span>
              </div>
            </div>

            {/* Biometric key badge */}
            <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl border border-slate-700">
              <Shield className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                  Biometric Key (Face ID)
                </p>
                <p className="text-blue-400 font-mono font-bold text-base">{student.faceId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Roll Number',    value: student.rollNo,              icon: Award,         bg: 'bg-blue-50 border-blue-200',    ic: 'text-blue-600' },
          { label: 'Admission Year', value: student.admissionYear.toString(), icon: Calendar,  bg: 'bg-indigo-50 border-indigo-200', ic: 'text-indigo-600' },
          { label: 'Section',        value: `Section ${student.section}`, icon: BookOpen,      bg: 'bg-violet-50 border-violet-200', ic: 'text-violet-600' },
          {
            label: 'Overall Attendance',
            value: `${att.overall}%`,
            icon: att.overall >= 75 ? CheckCircle2 : XCircle,
            bg:   att.overall >= 75 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200',
            ic:   att.overall >= 75 ? 'text-emerald-600' : 'text-red-600',
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-white rounded-xl border ${s.bg.split(' ')[1]} p-5`}>
              <div className={`w-9 h-9 rounded-lg border ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${s.ic}`} />
              </div>
              <p className="text-slate-400 text-xs mb-1">{s.label}</p>
              <p className={`font-extrabold text-lg ${s.ic}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Two-column info ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-blue-500" /> Personal Information
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Email',        value: student.email,   Icon: Mail },
              { label: 'Phone',        value: student.phone,   Icon: Phone },
              { label: 'Date of Birth', value: dob,            Icon: Calendar },
              { label: 'Blood Group',  value: student.bloodGroup, Icon: Droplets },
              { label: 'Address',      value: student.address, Icon: MapPin },
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

        {/* Attendance breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Wifi className="w-4 h-4 text-blue-500" /> Subject-wise Attendance
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
