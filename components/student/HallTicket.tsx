'use client';

import { useState } from 'react';
import { useApp, StudentUser } from '@/context/AppContext';
import { MOCK_ATTENDANCE, MOCK_EXAM_SCHEDULE } from '@/lib/mockData';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, XCircle, AlertTriangle, Printer, Download, X, Shield, Loader2 } from 'lucide-react';
import { downloadAsPDF } from '@/lib/utils';
import clsx from 'clsx';

export default function HallTicket() {
  const { state } = useApp();
  const student   = state.currentUser as StudentUser;
  const att       = MOCK_ATTENDANCE[student.rollNo as keyof typeof MOCK_ATTENDANCE];
  const fees      = state.fees[student.rollNo];

  const [showModal,    setShowModal]    = useState(false);
  const [downloading,  setDownloading]  = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    await downloadAsPDF(
      'hall-ticket-print',
      `HallTicket-${student.rollNo}-Sem${student.semester}.pdf`
    );
    setDownloading(false);
  };

  // ── Eligibility checks ──
  const attOk  = att.overall >= 75;
  const feeOk  = fees.items.every((i) => i.paid);
  const eligible = attOk && feeOk;

  const hallTicketNo = `HT-${student.batch}-${student.rollNo}-S${student.semester}`;
  const qrContent    = `https://presentify.edu.in/verify/${hallTicketNo}`;

  const initials = student.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      {/* ── Eligibility card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg">Exam Eligibility Verification</h3>
          <p className="text-slate-400 text-sm mt-0.5">
            Both conditions must be met to generate your hall ticket
          </p>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {/* Attendance check */}
          <EligibilityCard
            passed={attOk}
            title="Attendance Threshold"
            description="Minimum 75% required"
            detail={`Your attendance: ${att.overall}%`}
            icon={attOk ? CheckCircle2 : XCircle}
          />

          {/* Fee clearance check */}
          <EligibilityCard
            passed={feeOk}
            title="Accounts Clearance"
            description="No outstanding fee balance"
            detail={feeOk ? 'All dues cleared ✓' : 'Pending dues — pay via Fee Management'}
            icon={feeOk ? CheckCircle2 : AlertTriangle}
          />
        </div>

        <div className={clsx('px-6 py-5 border-t flex flex-wrap items-center justify-between gap-4',
          eligible ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
        )}>
          <div>
            {eligible ? (
              <>
                <p className="text-emerald-700 font-bold">✓ Eligible for Examination</p>
                <p className="text-emerald-600 text-sm mt-0.5">
                  You meet all criteria. Generate and print your hall ticket.
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-700 font-bold">Not Yet Eligible</p>
                <p className="text-slate-500 text-sm mt-0.5">
                  {!attOk && 'Attendance below 75%. '}
                  {!feeOk && 'Fee dues pending.'}
                </p>
              </>
            )}
          </div>
          <button
            id="btn-generate-hall-ticket"
            onClick={() => setShowModal(true)}
            disabled={!eligible}
            className={clsx(
              'flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all',
              eligible
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            )}
          >
            <Download className="w-4 h-4" /> Generate Hall Ticket
          </button>
        </div>
      </div>

      {/* ── Exam schedule preview ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Examination Schedule — Sem {student.semester}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Subject Code', 'Subject Name', 'Date', 'Time', 'Room', 'Seat No.', 'Duration'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_EXAM_SCHEDULE.map((ex) => (
                <tr key={ex.code} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-600">{ex.code}</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{ex.name}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(ex.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{ex.time}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{ex.room}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{ex.seat}</td>
                  <td className="px-4 py-3 text-slate-500">{ex.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════ HALL TICKET MODAL ══════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
            {/* Modal actions (no-print) */}
            <div className="no-print px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-slate-900">Hall Ticket Preview</h3>
                <p className="text-slate-400 text-xs">Sem {student.semester} End-Semester Examination 2026</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  {downloading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                    : <><Download className="w-4 h-4" /> Download PDF</>
                  }
                </button>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Hall ticket printable area ── */}
            <div className="p-8" id="hall-ticket-print">
              {/* University header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-14 h-14 bg-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-extrabold text-xl">PU</span>
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-extrabold text-slate-900 leading-none">PRESENTIFY UNIVERSITY</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Ahmedabad, Gujarat — 380009 &middot; Estd. 2010 &middot; NAAC A++</p>
                  </div>
                </div>
                <div className="mt-3 bg-slate-900 text-white py-2 rounded-lg">
                  <p className="font-bold text-sm tracking-wider uppercase">
                    End-Semester Examination — {student.batch} · Semester {student.semester}
                  </p>
                  <p className="text-slate-300 text-xs mt-0.5">June 2026 &middot; Hall Ticket</p>
                </div>
              </div>

              {/* Student details + QR */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Photo */}
                <div className="col-span-1 flex flex-col items-center gap-3">
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-3xl font-extrabold border-2 border-slate-300">
                    {initials}
                  </div>
                  <div className="w-28 h-28">
                    <QRCodeSVG
                      value={qrContent}
                      size={112}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      level="H"
                    />
                  </div>
                  <p className="text-center text-[9px] text-slate-400 leading-tight">
                    Scan to verify authenticity<br />presentify.edu.in/verify
                  </p>
                </div>

                {/* Details */}
                <div className="col-span-2 space-y-2">
                  {[
                    ['Hall Ticket No.',    hallTicketNo, true],
                    ['Student Name',       student.name, false],
                    ['Roll Number',        student.rollNo, false],
                    ['Branch',             student.branch, false],
                    ['Semester',           `Semester ${student.semester}`, false],
                    ['Batch',              student.batch, false],
                    ['Section',            `Section ${student.section}`, false],
                    ['Face Biometric ID',  student.faceId, false],
                  ].map(([label, value, highlight]) => (
                    <div key={label as string} className="flex">
                      <span className="text-slate-500 text-xs w-36 shrink-0 font-medium pt-0.5">{label as string}</span>
                      <span className={clsx('text-xs font-bold', highlight ? 'text-blue-700 font-mono text-sm' : 'text-slate-900')}>
                        : {value as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam schedule */}
              <div className="mb-6">
                <h4 className="text-slate-900 font-bold text-sm mb-2 uppercase tracking-wide border-b border-slate-200 pb-1">
                  Examination Timetable
                </h4>
                <table className="w-full text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      {['Code','Subject','Date','Time','Hall','Seat'].map(h => (
                        <th key={h} className="px-2 py-2 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {MOCK_EXAM_SCHEDULE.map((ex, i) => (
                      <tr key={ex.code} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-2 py-2 font-mono font-bold text-blue-700">{ex.code}</td>
                        <td className="px-2 py-2 font-medium text-slate-900">{ex.name}</td>
                        <td className="px-2 py-2 text-slate-700">{new Date(ex.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</td>
                        <td className="px-2 py-2 text-slate-700">{ex.time}</td>
                        <td className="px-2 py-2 text-slate-700">{ex.room}</td>
                        <td className="px-2 py-2 font-mono font-bold text-slate-900">{ex.seat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Security & signature footer */}
              <div className="border-t-2 border-slate-800 pt-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verified by Presentify Academic Office · Digital Seal Active</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      This hall ticket is valid only with a valid photo ID. Report to examination hall 30 minutes before.
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p className="border-t border-slate-400 pt-1 mt-6 px-4">Controller of Examinations</p>
                    <p className="text-[10px] text-slate-400">Presentify University</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EligibilityCard({
  passed, title, description, detail, icon: Icon,
}: {
  passed: boolean; title: string; description: string; detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className={clsx(
      'rounded-xl border p-5 flex items-start gap-4',
      passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
    )}>
      <div className={clsx('mt-0.5', passed ? 'text-emerald-600' : 'text-red-500')}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className={clsx('font-bold text-sm', passed ? 'text-emerald-800' : 'text-red-800')}>{title}</p>
        <p className={clsx('text-xs mt-0.5', passed ? 'text-emerald-600' : 'text-red-600')}>{description}</p>
        <p className={clsx('text-xs font-semibold mt-2 px-2 py-1 rounded-md w-fit',
          passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
        )}>
          {detail}
        </p>
      </div>
    </div>
  );
}
