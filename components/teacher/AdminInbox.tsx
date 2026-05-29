'use client';

import { useState } from 'react';
import { useApp, GrievanceTicket, TeacherUser } from '@/context/AppContext';
import { sanitizeInput } from '@/lib/utils';
import {
  FileText, Calendar, CheckCircle2, XCircle, Clock, Send,
  ChevronDown, Eye, Building2,
} from 'lucide-react';
import clsx from 'clsx';
import { formatDateTime } from '@/lib/utils';

const STATUS_CONFIG = {
  submitted:    { label: 'Submitted',    icon: Send,          color: 'bg-blue-100 text-blue-700 border-blue-200' },
  under_review: { label: 'Under Review', icon: Clock,         color: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved:     { label: 'Approved',     icon: CheckCircle2,  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected:     { label: 'Rejected',     icon: XCircle,       color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function AdminInbox() {
  const { state, dispatch } = useApp();
  const teacher = state.currentUser as TeacherUser;

  const [selectedTicket, setSelectedTicket] = useState<GrievanceTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [remarksInput, setRemarksInput] = useState('');
  const [remarksError, setRemarksError] = useState('');

  const tickets = state.tickets.filter((t) =>
    filterStatus === 'all' ? true : t.status === filterStatus
  );

  const pendingCount = state.tickets.filter(
    (t) => t.status === 'submitted' || t.status === 'under_review'
  ).length;

  const handleAction = (action: 'approved' | 'rejected') => {
    if (!selectedTicket) return;
    const cleanRemarks = sanitizeInput(remarksInput, 300);
    if (cleanRemarks.length < 3) {
      setRemarksError('Please add a brief remark before taking action.');
      return;
    }
    dispatch({
      type: 'UPDATE_TICKET',
      payload: {
        id:          selectedTicket.id,
        status:      action,
        remarks:     cleanRemarks,
        reviewedBy:  teacher.name,
      },
    });
    setSelectedTicket(null);
    setRemarksInput('');
    setRemarksError('');
  };

  return (
    <div className="space-y-6">
      {/* ── Summary bar ── */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',         value: state.tickets.length,                                          color: 'slate' },
          { label: 'Pending',       value: pendingCount,                                                   color: 'amber' },
          { label: 'Approved',      value: state.tickets.filter(t=>t.status==='approved').length,          color: 'emerald' },
          { label: 'Rejected',      value: state.tickets.filter(t=>t.status==='rejected').length,          color: 'red' },
        ].map((s) => {
          const colorMap: Record<string, string> = {
            slate:   'text-slate-900 border-slate-200',
            amber:   'text-amber-700 border-amber-200 bg-amber-50',
            emerald: 'text-emerald-700 border-emerald-200 bg-emerald-50',
            red:     'text-red-700 border-red-200 bg-red-50',
          };
          return (
            <div key={s.label} className={`bg-white rounded-xl border ${colorMap[s.color]} p-5`}>
              <p className="text-xs text-current opacity-60">{s.label} Requests</p>
              <p className="text-2xl font-extrabold mt-1">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Ticket list ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-3">
            <h3 className="font-bold text-slate-900">Incoming Requests</h3>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto scrollbar-thin">
            {tickets.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No tickets found.</p>
              </div>
            ) : (
              tickets.map((ticket) => {
                const cfg = STATUS_CONFIG[ticket.status];
                const StatusIcon = cfg.icon;
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => { setSelectedTicket(ticket); setRemarksInput(''); setRemarksError(''); }}
                    className={clsx(
                      'w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors',
                      isSelected && 'bg-blue-50 border-l-2 border-l-blue-500'
                    )}
                  >
                    <div className="mt-0.5">
                      {ticket.type === 'leave'
                        ? <Calendar className="w-5 h-5 text-indigo-500" />
                        : <Building2 className="w-5 h-5 text-blue-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{ticket.studentName}</span>
                        <span className={clsx('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', cfg.color)}>
                          <StatusIcon className="w-2.5 h-2.5" /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {ticket.type === 'leave' ? '📅 Leave Request' : '📄 Bonafide Certificate'} &middot; {ticket.studentBranch} Sem {ticket.studentSem}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateTime(ticket.submittedAt)}
                      </p>
                    </div>
                    <Eye className="w-4 h-4 text-slate-300 mt-1 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Detail / Action panel ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {!selectedTicket ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
              <Eye className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-semibold">Select a request to review</p>
              <p className="text-xs mt-1">Click any ticket from the inbox on the left</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {selectedTicket.type === 'leave'
                    ? <Calendar className="w-5 h-5 text-indigo-500" />
                    : <Building2 className="w-5 h-5 text-blue-500" />
                  }
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {selectedTicket.type === 'leave' ? 'Leave Request' : 'Bonafide Certificate Request'}
                    </h3>
                    <p className="text-slate-400 text-xs">{selectedTicket.id} &middot; {formatDateTime(selectedTicket.submittedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto max-h-[420px]">
                {/* Student info */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Details</h4>
                  {[
                    ['Name',    selectedTicket.studentName],
                    ['Roll No.',selectedTicket.studentId],
                    ['Branch',  `${selectedTicket.studentBranch} — Sem ${selectedTicket.studentSem}`],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-slate-400">{l}</span>
                      <span className="font-semibold text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Request details */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Request Details</h4>
                  {selectedTicket.type === 'leave' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Leave Period</span>
                        <span className="font-semibold text-slate-900">
                          {selectedTicket.dateFrom} → {selectedTicket.dateTo}
                        </span>
                      </div>
                      {selectedTicket.reason && (
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Reason</p>
                          <p className="text-slate-900 text-sm bg-white border border-slate-200 rounded-lg p-3">
                            {selectedTicket.reason}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Attachment</span>
                        <span className={clsx('font-semibold', selectedTicket.hasAttachment ? 'text-emerald-600' : 'text-slate-400')}>
                          {selectedTicket.hasAttachment ? '✓ Attached' : 'None'}
                        </span>
                      </div>
                    </>
                  )}

                  {selectedTicket.type === 'bonafide' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Purpose</span>
                        <span className="font-semibold text-slate-900">{selectedTicket.purpose}</span>
                      </div>

                      {/* Certificate preview letterhead */}
                      <div className="mt-3 border border-slate-200 rounded-xl p-4 bg-white text-xs">
                        <div className="text-center mb-3 border-b border-slate-200 pb-3">
                          <p className="font-extrabold text-slate-900 text-sm">PRESENTIFY UNIVERSITY</p>
                          <p className="text-slate-400">Ahmedabad, Gujarat — 380009</p>
                          <p className="font-semibold text-slate-700 mt-1 uppercase tracking-wide">Bonafide Certificate</p>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          This is to certify that <strong>{selectedTicket.studentName}</strong> (Roll No. <strong>{selectedTicket.studentId}</strong>) is a <em>bona fide</em> student of this institution, currently enrolled in the <strong>{selectedTicket.studentBranch}</strong> programme, Semester {selectedTicket.studentSem}, Batch {new Date().getFullYear()}.
                        </p>
                        <p className="text-slate-700 mt-2 leading-relaxed">
                          This certificate is issued for the purpose of <strong>{selectedTicket.purpose}</strong>.
                        </p>
                        <div className="mt-4 flex justify-between items-end text-[10px] text-slate-400">
                          <div>
                            <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                            <p>Ref No: {selectedTicket.id}</p>
                          </div>
                          <div className="text-right border-t border-slate-300 pt-1">
                            <p className="font-semibold text-slate-600">Authorised Signatory</p>
                            <p>Presentify University</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Previous remarks */}
                {selectedTicket.remarks && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
                    <p className="text-blue-600 font-semibold text-xs mb-1">Previous Remark ({selectedTicket.reviewedBy})</p>
                    <p className="text-blue-800">{selectedTicket.remarks}</p>
                  </div>
                )}

                {/* Action area */}
                {(selectedTicket.status === 'submitted' || selectedTicket.status === 'under_review') && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Remark / Comment <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={remarksInput}
                        onChange={(e) => { setRemarksInput(e.target.value); setRemarksError(''); }}
                        placeholder="Add a brief remark before approving or rejecting…"
                        maxLength={300}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      {remarksError && (
                        <p className="text-red-500 text-xs mt-1">{remarksError}</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        id="btn-approve-ticket"
                        onClick={() => handleAction('approved')}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        id="btn-reject-ticket"
                        onClick={() => handleAction('rejected')}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm transition-all"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                )}

                {(selectedTicket.status === 'approved' || selectedTicket.status === 'rejected') && (
                  <div className={clsx(
                    'flex items-center gap-2 p-4 rounded-xl text-sm font-semibold',
                    selectedTicket.status === 'approved'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  )}>
                    {selectedTicket.status === 'approved'
                      ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                      : <XCircle className="w-4 h-4 shrink-0" />
                    }
                    This request has been {selectedTicket.status}.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
