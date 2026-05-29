'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MOCK_USERS } from '@/lib/mockData';
import {
  GraduationCap,
  BookOpen,
  ChevronRight,
  Shield,
  Zap,
  Users,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { dispatch, state } = useApp();
  const [loading, setLoading] = useState<'student' | 'teacher' | null>(null);

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (state.currentUser) {
      router.push('/dashboard');
    }
  }, [state.currentUser, router]);

  const handleLogin = async (role: 'student' | 'teacher') => {
    setLoading(role);
    // Simulate auth round-trip
    await new Promise((res) => setTimeout(res, 900));
    const user = role === 'student' ? MOCK_USERS.student : MOCK_USERS.teacher;
    dispatch({ type: 'LOGIN', payload: user });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden flex items-center justify-center">
      {/* ── Animated gradient orbs ── */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl orb-animate"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 -right-24 w-[480px] h-[480px] rounded-full blur-3xl orb-animate-delayed"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full blur-3xl orb-animate-slow"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' }}
      />

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Main card area ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12">

        {/* Branding */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 ring-1 ring-blue-400/30">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none">
                Presentify
              </h1>
              <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mt-0.5">
                Academic ERP
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-base mt-2">
            Unified portal for Students &amp; Faculty — Phase 1 Demo
          </p>
          {/* Live status pill */}
          <div className="inline-flex items-center gap-2 mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Demo Environment — No real data stored
          </div>
        </div>

        {/* ── Login cards ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-10 animate-slide-up">

          {/* Student Card */}
          <button
            id="btn-demo-student"
            onClick={() => handleLogin('student')}
            disabled={loading !== null}
            className="group relative text-left p-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-xl hover:border-blue-500/60 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {/* hover glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative space-y-5">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl border border-blue-500/30 bg-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                <BookOpen className="w-7 h-7 text-blue-400" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Student Portal</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Fees · Hall Ticket · Results · Grievances
                </p>
              </div>

              {/* Credential display */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2.5 rounded-lg">
                  <span className="text-slate-500 text-xs">Roll Number</span>
                  <span className="text-white text-xs font-mono font-semibold tracking-wide">STU202601</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2.5 rounded-lg">
                  <span className="text-slate-500 text-xs">Password</span>
                  <span className="text-slate-400 text-xs font-mono">●●●●●●●● (any)</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                {loading === 'student' ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Login as Demo Student
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </div>
          </button>

          {/* Teacher Card */}
          <button
            id="btn-demo-teacher"
            onClick={() => handleLogin('teacher')}
            disabled={loading !== null}
            className="group relative text-left p-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-xl hover:border-indigo-500/60 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative space-y-5">
              <div className="w-14 h-14 rounded-xl border border-indigo-500/30 bg-indigo-500/15 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors">
                <GraduationCap className="w-7 h-7 text-indigo-400" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Faculty Portal</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Marks Entry · Admin Inbox · Classroom Hub
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2.5 rounded-lg">
                  <span className="text-slate-500 text-xs">Faculty ID</span>
                  <span className="text-white text-xs font-mono font-semibold tracking-wide">FAC202699</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 px-3 py-2.5 rounded-lg">
                  <span className="text-slate-500 text-xs">Password</span>
                  <span className="text-slate-400 text-xs font-mono">●●●●●●●● (any)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                {loading === 'teacher' ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Login as Demo Teacher
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in">
          {[
            'Fee Management',
            'Hall Ticket Generator',
            'Live Results',
            'Grievance Desk',
            'Classroom Hub',
            'Face Attendance',
          ].map((f) => (
            <span
              key={f}
              className="text-xs text-slate-400 border border-slate-700/50 bg-slate-800/30 px-3 py-1 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-slate-600 text-xs space-y-1 animate-fade-in">
          <div className="flex items-center justify-center gap-6">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-500" /> Secured Demo
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" /> Dual-Role Access
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-slate-500" /> Presentify v1.0
            </span>
          </div>
          <p>© 2026 Presentify Academic Systems. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
