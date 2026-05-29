'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MOCK_CLASSROOMS } from '@/lib/mockData';
import {
  Wifi, WifiOff, ExternalLink, FileText, Archive,
  Megaphone, ClipboardList, ChevronLeft, Download,
  CheckCircle2, AlertCircle, Calendar, Users,
} from 'lucide-react';
import clsx from 'clsx';

type FeedTab = 'announcements' | 'resources' | 'assignments';

type Classroom = typeof MOCK_CLASSROOMS[number];

export default function ClassroomHub() {
  const { state, dispatch } = useApp();
  const isConnected = state.classroomConnected;
  const [connecting, setConnecting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Classroom | null>(null);
  const [feedTab, setFeedTab] = useState<FeedTab>('announcements');

  const handleSync = async () => {
    setConnecting(true);
    await new Promise((res) => setTimeout(res, 2000));
    dispatch({ type: 'CONNECT_CLASSROOM' });
    setConnecting(false);
  };

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        feedTab={feedTab}
        onFeedTabChange={setFeedTab}
        onBack={() => { setSelectedCourse(null); setFeedTab('announcements'); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Sync banner ── */}
      <div className={clsx(
        'rounded-2xl border px-6 py-5 flex flex-wrap items-center justify-between gap-4',
        isConnected
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-slate-900 border-slate-700'
      )}>
        <div className="flex items-center gap-4">
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            isConnected ? 'bg-emerald-100' : 'bg-slate-800'
          )}>
            {isConnected
              ? <Wifi className="w-6 h-6 text-emerald-600" />
              : <WifiOff className="w-6 h-6 text-slate-400" />
            }
          </div>
          <div>
            <p className={clsx('font-bold text-sm', isConnected ? 'text-emerald-800' : 'text-white')}>
              {isConnected ? 'Institutional Workspace — Synced' : 'Sync Institutional Workspace Account'}
            </p>
            <p className={clsx('text-xs mt-0.5', isConnected ? 'text-emerald-600' : 'text-slate-400')}>
              {isConnected
                ? `Connected as presentify.edu.in · ${MOCK_CLASSROOMS.length} active classrooms loaded`
                : 'Connect your Google Workspace to access classrooms, resources & assignments'
              }
            </p>
          </div>
        </div>

        {!isConnected && (
          <button
            id="btn-sync-classroom"
            onClick={handleSync}
            disabled={connecting}
            className="flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-900 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-60"
          >
            {connecting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sync with Google Workspace
              </>
            )}
          </button>
        )}

        {isConnected && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" /> Connected &amp; Synced
          </div>
        )}
      </div>

      {!isConnected ? (
        /* Pre-connect placeholder */
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <WifiOff className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-extrabold text-xl mb-2">Not Connected Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Click the "Sync with Google Workspace" button above to connect your institutional account and view your active classrooms.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Announcements', 'Resources', 'Assignments', 'Due Dates'].map((f) => (
              <span key={f} className="text-xs text-slate-400 border border-slate-200 px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      ) : (
        /* Course cards grid */
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Active Classrooms ({MOCK_CLASSROOMS.length})</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_CLASSROOMS.map((course) => (
              <button
                key={course.id}
                id={`course-${course.id}`}
                onClick={() => setSelectedCourse(course)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 text-left"
              >
                {/* Colored header */}
                <div className={`h-20 bg-gradient-to-br ${course.colorClass} relative overflow-hidden`}>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(255,255,255,.2) 8px,rgba(255,255,255,.2) 16px)' }}
                  />
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wider">{course.code}</p>
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{course.name}</h4>
                  <p className="text-slate-400 text-xs mb-4">{course.section}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <Megaphone className="w-3.5 h-3.5" /> {course.announcements.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5" /> {course.assignments.length}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500 truncate">{course.teacher}</span>
                    <span className="text-xs text-blue-600 font-semibold group-hover:underline">
                      Open →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CourseDetail({
  course, feedTab, onFeedTabChange, onBack,
}: {
  course: Classroom;
  feedTab: FeedTab;
  onFeedTabChange: (t: FeedTab) => void;
  onBack: () => void;
}) {
  const pendingAssignments = course.assignments.filter((a) => !a.submitted);
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Classrooms
        </button>
      </div>

      {/* Course banner */}
      <div className={`h-32 bg-gradient-to-br ${course.colorClass} rounded-2xl relative overflow-hidden flex items-end`}>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'repeating-linear-gradient(-45deg,transparent,transparent 10px,rgba(255,255,255,.2) 10px,rgba(255,255,255,.2) 20px)'}} />
        <div className="relative p-6 text-white">
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">{course.code}</p>
          <h2 className="text-2xl font-extrabold leading-tight">{course.name}</h2>
          <p className="text-sm opacity-80 mt-0.5">{course.section} &middot; {course.teacher}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Students',     value: course.students.toString(),          icon: Users },
          { label: 'Announcements',value: course.announcements.length.toString(), icon: Megaphone },
          { label: 'Assignments',  value: `${pendingAssignments.length} pending`, icon: ClipboardList },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <Icon className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-900 font-extrabold text-lg">{s.value}</p>
              <p className="text-slate-400 text-xs">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Feed tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {([
            ['announcements', 'Announcements', Megaphone],
            ['resources',     'Resources',     Archive],
            ['assignments',   'Assignments',   ClipboardList],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => onFeedTabChange(id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all border-b-2',
                feedTab === id
                  ? 'text-blue-600 border-blue-600 bg-blue-50/40'
                  : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 max-h-[480px] overflow-y-auto scrollbar-thin">
          {/* Announcements */}
          {feedTab === 'announcements' && (
            course.announcements.map((ann) => (
              <div key={ann.id} className="border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Megaphone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {course.teacher} &middot; {new Date(ann.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed ml-11">{ann.body}</p>
                {ann.attachments.length > 0 && (
                  <div className="ml-11 space-y-1.5">
                    {ann.attachments.map((att) => (
                      <div key={att.name} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
                        <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-slate-700 font-medium flex-1 truncate">{att.name}</span>
                        <span className="text-slate-400">{att.size}</span>
                        <Download className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Resources */}
          {feedTab === 'resources' && (
            <div className="space-y-3">
              {course.resources.map((res) => {
                const isZip = res.type === 'zip';
                return (
                  <div key={res.id} className="flex items-center gap-4 border border-slate-200 rounded-xl px-5 py-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all group cursor-pointer">
                    <div className={clsx(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs',
                      isZip ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    )}>
                      {isZip ? 'ZIP' : 'PDF'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-semibold text-sm truncate">{res.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {res.size} &middot; Uploaded {new Date(res.uploaded).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Assignments */}
          {feedTab === 'assignments' && (
            <div className="space-y-3">
              {course.assignments.map((asgn) => {
                const dueDate  = new Date(asgn.dueDate);
                const isOverdue = !asgn.submitted && dueDate < new Date();
                return (
                  <div key={asgn.id} className={clsx(
                    'border rounded-xl px-5 py-4 space-y-2',
                    asgn.submitted
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : isOverdue
                        ? 'border-red-200 bg-red-50/40'
                        : 'border-slate-200 bg-white'
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <ClipboardList className={clsx('w-5 h-5 mt-0.5 shrink-0', asgn.submitted ? 'text-emerald-600' : isOverdue ? 'text-red-500' : 'text-slate-500')} />
                        <div>
                          <p className="text-slate-900 font-bold text-sm">{asgn.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">Max Marks: {asgn.maxMarks}</p>
                        </div>
                      </div>
                      {asgn.submitted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" /> Submitted
                        </span>
                      ) : (
                        <span className={clsx(
                          'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap',
                          isOverdue ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                        )}>
                          {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                          {isOverdue ? 'Overdue' : 'Pending'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-8">
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {dueDate.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
