'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Wifi, WifiOff, ExternalLink, FileText, Archive,
  Megaphone, ClipboardList, ChevronLeft, Download,
  CheckCircle2, AlertCircle, Calendar, Users, Loader2,
  LogOut, RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';

// ── Types matching Google Classroom API responses ──────────────────────────
interface GCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  ownerId?: string;
  courseState: string;
  alternateLink: string;
  creationTime: string;
  enrollmentCode?: string;
}

interface GAnnouncement {
  id: string;
  text: string;
  creationTime: string;
  updateTime: string;
  alternateLink: string;
  materials?: GMaterial[];
}

interface GWork {
  id: string;
  title: string;
  description?: string;
  maxPoints?: number;
  dueDate?: { year: number; month: number; day: number };
  state: string;
  alternateLink: string;
  workType: string;
}

interface GMaterialItem {
  id: string;
  title: string;
  materials?: GMaterial[];
  alternateLink: string;
  creationTime: string;
}

interface GMaterial {
  driveFile?:     { driveFile: { title: string; alternateLink: string } };
  youtubeVideo?:  { title: string; alternateLink: string };
  link?:          { url: string; title: string };
  form?:          { title: string; formUrl: string };
}

type FeedTab = 'announcements' | 'materials' | 'assignments';

const COURSE_COLORS = [
  'from-violet-500 to-indigo-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-fuchsia-600',
];

export default function ClassroomHub() {
  const { data: session, status } = useSession();
  const isConnected = status === 'authenticated' && !!session?.accessToken;
  const isLoading   = status === 'loading';

  const [courses,    setCourses]    = useState<GCourse[]>([]);
  const [fetching,   setFetching]   = useState(false);
  const [selected,   setSelected]   = useState<GCourse | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!isConnected) return;
    setFetching(true);
    setError(null);
    try {
      const res = await fetch('/api/classroom/courses');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: GCourse[] = await res.json();
      setCourses(data);
    } catch (e: any) {
      setError('Failed to load courses. Please try reconnecting.');
    } finally {
      setFetching(false);
    }
  }, [isConnected]);

  // Auto-fetch courses when session is available
  useEffect(() => {
    if (isConnected && courses.length === 0) fetchCourses();
  }, [isConnected]);              // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (selected) {
    return (
      <CourseDetail
        course={selected}
        accessToken={session?.accessToken ?? ''}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Connection banner ── */}
      <div className={clsx(
        'rounded-2xl border px-6 py-5 flex flex-wrap items-center justify-between gap-4',
        isConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-900 border-slate-700'
      )}>
        <div className="flex items-center gap-4">
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center',
            isConnected ? 'bg-emerald-100' : 'bg-slate-800'
          )}>
            {isConnected
              ? <Wifi className="w-6 h-6 text-emerald-600" />
              : <WifiOff className="w-6 h-6 text-slate-400" />
            }
          </div>
          <div>
            <p className={clsx('font-bold text-sm', isConnected ? 'text-emerald-800' : 'text-white')}>
              {isConnected
                ? `Connected as ${session?.user?.email}`
                : 'Connect your Google Workspace Account'
              }
            </p>
            <p className={clsx('text-xs mt-0.5', isConnected ? 'text-emerald-600' : 'text-slate-400')}>
              {isConnected
                ? `${courses.length} active classroom${courses.length !== 1 ? 's' : ''} loaded`
                : 'Sign in with Google to access your classrooms, resources & assignments'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button
              id="btn-sync-classroom"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-900 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md"
            >
              {/* Google G mark */}
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google Workspace
            </button>
          ) : (
            <>
              <button
                onClick={fetchCourses}
                disabled={fetching}
                className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', fetching && 'animate-spin')} />
                Refresh
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/dashboard' })}
                className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" /> Disconnect
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {/* ── Not connected placeholder ── */}
      {!isConnected && (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <WifiOff className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-extrabold text-xl mb-2">Not Connected</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Sign in with your Google Workspace account to load your live classrooms, announcements, resources and assignments.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Live Announcements', 'Resources', 'Assignments', 'Due Dates'].map((f) => (
              <span key={f} className="text-xs text-slate-400 border border-slate-200 px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {isConnected && fetching && courses.length === 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-20 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Course grid ── */}
      {isConnected && courses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Active Classrooms ({courses.length})</h3>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Live from Google Classroom
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course, idx) => (
              <button
                key={course.id}
                id={`course-${course.id}`}
                onClick={() => setSelected(course)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 text-left"
              >
                <div className={`h-20 bg-gradient-to-br ${COURSE_COLORS[idx % COURSE_COLORS.length]} relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 8px,rgba(255,255,255,.2) 8px,rgba(255,255,255,.2) 16px)' }} />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider truncate">{course.section ?? 'No section'}</p>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight mb-3 line-clamp-2">{course.name}</h4>
                  <div className="flex items-center justify-between">
                    {course.enrollmentCode && (
                      <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-lg">
                        Code: {course.enrollmentCode}
                      </span>
                    )}
                    <span className="text-xs text-violet-600 font-semibold ml-auto group-hover:underline">Open →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty courses ── */}
      {isConnected && !fetching && courses.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-slate-900 font-bold text-lg mb-2">No Active Classrooms</h3>
          <p className="text-slate-400 text-sm">No active courses found in your Google Classroom account.</p>
        </div>
      )}
    </div>
  );
}

// ── Course Detail View ────────────────────────────────────────────────────
function CourseDetail({ course, accessToken, onBack }: {
  course: GCourse;
  accessToken: string;
  onBack: () => void;
}) {
  const [feedTab,       setFeedTab]       = useState<FeedTab>('announcements');
  const [announcements, setAnnouncements] = useState<GAnnouncement[]>([]);
  const [assignments,   setAssignments]   = useState<GWork[]>([]);
  const [materials,     setMaterials]     = useState<GMaterialItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/classroom/course-detail?courseId=${course.id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAnnouncements(data.announcements ?? []);
        setAssignments(data.assignments ?? []);
        setMaterials(data.materials ?? []);
      } catch {
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [course.id]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatDue = (d?: { year: number; month: number; day: number }) =>
    d ? new Date(d.year, d.month - 1, d.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'No due date';

  const isOverdue = (d?: { year: number; month: number; day: number }) =>
    d ? new Date(d.year, d.month - 1, d.day) < new Date() : false;

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Classrooms
      </button>

      {/* Banner */}
      <div className="h-32 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl relative overflow-hidden flex items-end">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 10px,rgba(255,255,255,.2) 10px,rgba(255,255,255,.2) 20px)' }} />
        <div className="relative p-6 text-white flex items-end justify-between w-full">
          <div>
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">{course.section ?? 'Classroom'}</p>
            <h2 className="text-2xl font-extrabold leading-tight">{course.name}</h2>
          </div>
          <a
            href={course.alternateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all"
          >
            Open in Classroom <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Feed tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {([
            ['announcements', 'Announcements', Megaphone, announcements.length],
            ['materials',     'Resources',     Archive,   materials.length],
            ['assignments',   'Assignments',   ClipboardList, assignments.length],
          ] as const).map(([id, label, Icon, count]) => (
            <button
              key={id}
              onClick={() => setFeedTab(id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all border-b-2',
                feedTab === id
                  ? 'text-violet-600 border-violet-600 bg-violet-50/40'
                  : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon className="w-4 h-4" /> {label}
              {!loading && count > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-full">{count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5 max-h-[520px] overflow-y-auto space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
          )}

          {error && !loading && (
            <div className="text-red-500 text-sm text-center py-8">{error}</div>
          )}

          {/* Announcements */}
          {!loading && feedTab === 'announcements' && (
            announcements.length === 0
              ? <EmptyState label="No announcements yet" />
              : announcements.map((ann) => (
                  <div key={ann.id} className="border border-slate-200 rounded-xl p-5 space-y-2 hover:border-slate-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Megaphone className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 text-xs mt-0.5">{formatDate(ann.creationTime)}</p>
                        <p className="text-slate-800 text-sm mt-1 leading-relaxed whitespace-pre-line">{ann.text}</p>
                        {ann.materials && ann.materials.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {ann.materials.map((mat, i) => {
                              const link = mat.driveFile?.driveFile.alternateLink ?? mat.youtubeVideo?.alternateLink ?? mat.link?.url ?? mat.form?.formUrl ?? '#';
                              const title = mat.driveFile?.driveFile.title ?? mat.youtubeVideo?.title ?? mat.link?.title ?? mat.form?.title ?? 'Attachment';
                              return (
                                <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs hover:border-violet-300 transition-colors">
                                  <FileText className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                                  <span className="text-slate-700 font-medium flex-1 truncate">{title}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
          )}

          {/* Materials */}
          {!loading && feedTab === 'materials' && (
            materials.length === 0
              ? <EmptyState label="No resources posted yet" />
              : materials.map((mat) => (
                  <a key={mat.id} href={mat.alternateLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 border border-slate-200 rounded-xl px-5 py-4 hover:border-violet-300 hover:bg-violet-50/30 transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                      <Archive className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-semibold text-sm truncate">{mat.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{formatDate(mat.creationTime)}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                  </a>
                ))
          )}

          {/* Assignments */}
          {!loading && feedTab === 'assignments' && (
            assignments.length === 0
              ? <EmptyState label="No assignments posted yet" />
              : assignments.map((asgn) => {
                  const overdue = isOverdue(asgn.dueDate);
                  return (
                    <a key={asgn.id} href={asgn.alternateLink} target="_blank" rel="noopener noreferrer"
                      className={clsx('block border rounded-xl px-5 py-4 space-y-2 transition-all hover:shadow-sm',
                        overdue ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white hover:border-violet-300'
                      )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <ClipboardList className={clsx('w-5 h-5 mt-0.5 shrink-0', overdue ? 'text-red-500' : 'text-slate-400')} />
                          <div>
                            <p className="text-slate-900 font-bold text-sm">{asgn.title}</p>
                            {asgn.description && <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{asgn.description}</p>}
                            {asgn.maxPoints != null && (
                              <p className="text-slate-400 text-xs mt-0.5">Max marks: {asgn.maxPoints}</p>
                            )}
                          </div>
                        </div>
                        <span className={clsx(
                          'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0',
                          overdue ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                        )}>
                          {overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                          {overdue ? 'Overdue' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-8">
                        <Calendar className="w-3.5 h-3.5" /> Due: {formatDue(asgn.dueDate)}
                      </div>
                    </a>
                  );
                })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .513v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
