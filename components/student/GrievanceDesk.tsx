'use client';

import { useState } from 'react';
import { useApp, StudentUser, GrievanceTicket } from '@/context/AppContext';
import { sanitizeInput, generateTicketId, formatDateTime } from '@/lib/utils';
import { FileText, Calendar, Upload, ChevronDown, Send, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

type TicketType = 'leave' | 'bonafide';

const BONAFIDE_PURPOSES = [
  'Internship Verification',
  'Bank Loan / Education Loan',
  'Passport Application',
  'Visa Application',
  'Scholarship Application',
  'Higher Education (GATE/GRE)',
  'Government Job Application',
  'Other Purpose',
];

const STATUS_CONFIG = {
  submitted:    { label: 'Submitted',    icon: Send,          color: 'bg-blue-100 text-blue-700 border-blue-200' },
  under_review: { label: 'Under Review', icon: Clock,         color: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved:     { label: 'Approved',     icon: CheckCircle2,  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected:     { label: 'Rejected',     icon: XCircle,       color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function GrievanceDesk() {
  const { state, dispatch } = useApp();
  const student = state.currentUser as StudentUser;
  const myTickets = state.tickets.filter((t) => t.studentId === student.rollNo);

  const [activeTab, setActiveTab] = useState<TicketType>('leave');
  const [submitted, setSubmitted]  = useState(false);

  // Leave form state
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [reason,       setReason]       = useState('');
  const [hasFile,      setHasFile]      = useState(false);
  const [leaveErrors,  setLeaveErrors]  = useState<string[]>([]);

  // Bonafide form state
  const [purpose,       setPurpose]       = useState('');
  const [bonafideErrors, setBonafideErrors] = useState<string[]>([]);

  // ── Submit Leave ──
  const handleSubmitLeave = () => {
    const errs: string[] = [];
    if (!dateFrom)                    errs.push('Start date is required.');
    if (!dateTo)                      errs.push('End date is required.');
    if (dateTo && dateTo < dateFrom)  errs.push('End date must be after start date.');
    const cleanReason = sanitizeInput(reason, 500);
    if (cleanReason.length < 10)      errs.push('Reason must be at least 10 characters.');
    setLeaveErrors(errs);
    if (errs.length) return;

    const ticket: GrievanceTicket = {
      id:            generateTicketId(),
      studentId:     student.rollNo,
      studentName:   student.name,
      studentBranch: student.branchCode,
      studentSem:    student.semester,
      type:          'leave',
      status:        'submitted',
      submittedAt:   new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
      dateFrom,
      dateTo,
      reason:        cleanReason,
      hasAttachment: hasFile,
    };
    dispatch({ type: 'SUBMIT_TICKET', payload: ticket });
    setDateFrom(''); setDateTo(''); setReason(''); setHasFile(false); setLeaveErrors([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  // ── Submit Bonafide ──
  const handleSubmitBonafide = () => {
    const errs: string[] = [];
    if (!purpose) errs.push('Please select a purpose.');
    setBonafideErrors(errs);
    if (errs.length) return;

    const ticket: GrievanceTicket = {
      id:            generateTicketId(),
      studentId:     student.rollNo,
      studentName:   student.name,
      studentBranch: student.branchCode,
      studentSem:    student.semester,
      type:          'bonafide',
      status:        'submitted',
      submittedAt:   new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
      purpose,
    };
    dispatch({ type: 'SUBMIT_TICKET', payload: ticket });
    setPurpose(''); setBonafideErrors([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Form panel ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-slate-200">
            {(['leave','bonafide'] as TicketType[]).map((t) => (
              <button
                key={t}
                id={`tab-${t}`}
                onClick={() => setActiveTab(t)}
                className={clsx(
                  'flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all',
                  activeTab === t
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                )}
              >
                {t === 'leave' ? <Calendar className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {t === 'leave' ? 'Leave Request' : 'Bonafide Certificate'}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {/* ── Leave form ── */}
            {activeTab === 'leave' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="From Date" required>
                    <input
                      id="leave-from"
                      type="date"
                      value={dateFrom}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="input-base"
                    />
                  </FormField>
                  <FormField label="To Date" required>
                    <input
                      id="leave-to"
                      type="date"
                      value={dateTo}
                      min={dateFrom || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="input-base"
                    />
                  </FormField>
                </div>

                <FormField label="Reason for Leave" required>
                  <textarea
                    id="leave-reason"
                    rows={4}
                    value={reason}
                    placeholder="Describe the reason for your leave application (min 10 characters)…"
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                    className="input-base resize-none"
                  />
                  <p className="text-slate-400 text-xs mt-1 text-right">{reason.length}/500</p>
                </FormField>

                <FormField label="Supporting Document (Optional)">
                  <label
                    className="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                    htmlFor="leave-file"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {hasFile ? '✓ Document attached' : 'Click to attach file'}
                      </p>
                      <p className="text-slate-400 text-xs">PDF, JPG, PNG — max 5 MB</p>
                    </div>
                    <input
                      id="leave-file"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setHasFile(e.target.files !== null && e.target.files.length > 0)}
                    />
                  </label>
                </FormField>

                {leaveErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    {leaveErrors.map((e) => (
                      <p key={e} className="text-red-600 text-sm flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 shrink-0" /> {e}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  id="btn-submit-leave"
                  onClick={handleSubmitLeave}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/25"
                >
                  <Send className="w-4 h-4" /> Submit Leave Request
                </button>
              </>
            )}

            {/* ── Bonafide form ── */}
            {activeTab === 'bonafide' && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-1">Bonafide Certificate Request</p>
                  <p className="text-blue-600 text-xs">
                    A bonafide certificate confirms your enrollment at Presentify University. It is typically processed within 2–3 working days.
                  </p>
                </div>

                <FormField label="Purpose of Certificate" required>
                  <div className="relative">
                    <select
                      id="bonafide-purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="input-base appearance-none pr-10"
                    >
                      <option value="">— Select purpose —</option>
                      {BONAFIDE_PURPOSES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </FormField>

                {/* Auto-filled fields */}
                <div className="space-y-3 text-sm">
                  {[
                    ['Student Name',  student.name],
                    ['Roll Number',   student.rollNo],
                    ['Branch',        student.branch],
                    ['Semester',      `Semester ${student.semester}`],
                    ['Batch',         student.batch],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-lg">
                      <span className="text-slate-400 text-xs">{l}</span>
                      <span className="text-slate-900 font-semibold text-xs">{v}</span>
                    </div>
                  ))}
                </div>

                {bonafideErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    {bonafideErrors.map((e) => (
                      <p key={e} className="text-red-600 text-sm flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 shrink-0" /> {e}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  id="btn-submit-bonafide"
                  onClick={handleSubmitBonafide}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/25"
                >
                  <Send className="w-4 h-4" /> Submit Bonafide Request
                </button>
              </>
            )}

            {/* Success toast */}
            {submitted && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-emerald-800 font-bold text-sm">Request submitted!</p>
                  <p className="text-emerald-600 text-xs">Visible in your Active Requests panel on the right.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Active Requests timeline ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Active Requests</h3>
            <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
              {myTickets.length} total
            </span>
          </div>

          <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto scrollbar-thin">
            {myTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No requests submitted yet.</p>
              </div>
            ) : (
              myTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: GrievanceTicket }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[ticket.status];
  const Icon = cfg.icon;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="mt-0.5">
          {ticket.type === 'leave' ? (
            <Calendar className="w-5 h-5 text-indigo-500" />
          ) : (
            <FileText className="w-5 h-5 text-blue-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">
              {ticket.type === 'leave' ? 'Leave Request' : 'Bonafide Certificate'}
            </span>
            <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border status-badge', cfg.color)}>
              <Icon className="w-3 h-3" /> {cfg.label}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            {formatDateTime(ticket.submittedAt)} &middot; {ticket.id}
          </p>
          {ticket.type === 'leave' && (
            <p className="text-slate-500 text-xs mt-0.5">
              {ticket.dateFrom} → {ticket.dateTo}
            </p>
          )}
          {ticket.type === 'bonafide' && (
            <p className="text-slate-500 text-xs mt-0.5">{ticket.purpose}</p>
          )}
        </div>
        <ChevronDown className={clsx('w-4 h-4 text-slate-400 shrink-0 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3 animate-fade-in">
          {/* Status timeline */}
          <div className="flex items-center gap-1.5">
            {(['submitted','under_review','approved'] as const).map((s, i) => {
              const statuses = ['submitted','under_review','approved','rejected'];
              const currentIdx = statuses.indexOf(ticket.status);
              const thisIdx    = statuses.indexOf(s);
              const isPast     = thisIdx <= currentIdx;
              const isRejected = ticket.status === 'rejected';
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    isPast && !isRejected ? 'bg-blue-500' : isRejected && s === 'approved' ? 'bg-red-400' : 'bg-slate-200'
                  )} />
                  <span className={clsx('text-[10px] font-medium', isPast && !isRejected ? 'text-blue-600' : 'text-slate-400')}>
                    {STATUS_CONFIG[s].label}
                  </span>
                  {i < 2 && <div className={clsx('w-6 h-px', isPast && !isRejected ? 'bg-blue-300' : 'bg-slate-200')} />}
                </div>
              );
            })}
          </div>

          {ticket.reason && (
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
              <span className="font-semibold text-slate-700">Reason: </span>{ticket.reason}
            </p>
          )}
          {ticket.remarks && (
            <p className="text-xs text-slate-600 bg-blue-50 border border-blue-100 p-3 rounded-lg">
              <span className="font-semibold text-blue-700">Remarks ({ticket.reviewedBy}): </span>
              {ticket.remarks}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
