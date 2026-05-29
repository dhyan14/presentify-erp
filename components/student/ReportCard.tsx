'use client';

import { useState } from 'react';
import { useApp, StudentUser } from '@/context/AppContext';
import { MOCK_MARKS_INITIAL, MOCK_SUBJECTS_SEM4 } from '@/lib/mockData';
import { getGrade, calculateSPI, downloadAsPDF } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, BookOpen, Clock, Download, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function ReportCard() {
  const { state }  = useApp();
  const student    = state.currentUser as StudentUser;
  const sem4State  = state.marks[student.rollNo]?.sem4;
  const historical = MOCK_MARKS_INITIAL.STU202601.historicalSemesters;

  const [downloading, setDownloading] = useState(false);

  // Build chart data
  const chartData = [
    ...historical.map((s) => ({ name: `Sem ${s.sem}`, spi: s.spi })),
    sem4State?.published
      ? {
          name: `Sem ${student.semester}`,
          spi: (() => {
            const subs = MOCK_SUBJECTS_SEM4.map((sub) => {
              const m = sem4State.subjects[sub.code];
              return { credits: sub.credits, internal: m?.internal ?? 0, external: m?.external ?? 0 };
            });
            return calculateSPI(subs);
          })(),
        }
      : { name: `Sem ${student.semester}`, spi: null },
  ];

  const completedSPIs = chartData.filter((d) => d.spi !== null).map((d) => d.spi as number);
  const cpi = completedSPIs.length
    ? Math.round((completedSPIs.reduce((a, b) => a + b, 0) / completedSPIs.length) * 100) / 100
    : 0;

  // Current sem SPI (if published)
  const currentSPI = sem4State?.published
    ? calculateSPI(
        MOCK_SUBJECTS_SEM4.map((sub) => {
          const m = sem4State.subjects[sub.code];
          return { credits: sub.credits, internal: m?.internal ?? 0, external: m?.external ?? 0 };
        })
      )
    : null;

  const handleDownload = async () => {
    setDownloading(true);
    await downloadAsPDF(
      'report-card-pdf',
      `ReportCard-${student.rollNo}-AY2025-26.pdf`
    );
    setDownloading(false);
  };

  return (
    <div className="space-y-6">

      {/* ── Page header with Download button ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Academic Report Card</h2>
          <p className="text-slate-400 text-sm mt-0.5">{student.name} · {student.branch} · Sem {student.semester}</p>
        </div>
        <button
          id="btn-download-report-card"
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-600/25"
        >
          {downloading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF…</>
            : <><Download className="w-4 h-4" /> Download Report Card</>
          }
        </button>
      </div>

      {/* ── Summary row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Cumulative PI"         value={cpi.toFixed(2)}  sub="Based on published semesters"    icon={TrendingUp} color="blue" />
        {historical.slice(-1).map((s) => (
          <SummaryCard key={s.sem} label={`Sem ${s.sem} SPI`} value={s.spi.toFixed(1)} sub="Last completed semester" icon={Award} color="emerald" />
        ))}
        <SummaryCard
          label="Current Semester"
          value={sem4State?.published ? 'Published' : 'Awaited'}
          sub={`Sem ${student.semester} results`}
          icon={sem4State?.published ? Award : Clock}
          color={sem4State?.published ? 'violet' : 'amber'}
        />
        <SummaryCard label="Completed Semesters" value={completedSPIs.length.toString()} sub="of 8 total semesters" icon={BookOpen} color="slate" />
      </div>

      {/* ── SPI trend chart ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-500" /> SPI Trend Chart
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              formatter={(v: unknown) => [v !== null ? (v as number).toFixed(2) : 'N/A', 'SPI']}
            />
            <Bar dataKey="spi" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.spi === null ? '#e2e8f0' : entry.spi >= 9 ? '#8b5cf6' : entry.spi >= 8 ? '#3b82f6' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 justify-center mt-2 text-xs text-slate-500">
          {[['#8b5cf6','SPI ≥ 9.0'],['#3b82f6','SPI ≥ 8.0'],['#10b981','SPI < 8.0'],['#e2e8f0','Pending']].map(([color,label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Current Semester marks table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">Semester {student.semester} — Report Card</h3>
            <p className="text-slate-400 text-sm mt-0.5">AY 2025-26 · {student.branchCode}</p>
          </div>
          {sem4State?.published && (
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              ✓ Published
            </span>
          )}
        </div>

        {!sem4State?.published ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h4 className="text-slate-900 font-bold text-lg mb-2">Results Awaited</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Your Semester {student.semester} marks have not been published yet. Check back after the examination.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['Code','Subject','Credits','Internal /30','External /70','Total /100','Grade','Points'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_SUBJECTS_SEM4.map((sub) => {
                  const m = sem4State.subjects[sub.code];
                  const internalVal = m?.internal ?? 0;
                  const externalVal = m?.external ?? 0;
                  const total = internalVal + externalVal;
                  const { grade, points, color } = getGrade(total);
                  return (
                    <tr key={sub.code} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono font-bold text-violet-600">{sub.code}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">{sub.name}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{sub.credits}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-900">{internalVal}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-900">{externalVal}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-900">{total}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx('inline-block px-2.5 py-1 rounded-full text-xs font-bold border', color)}>{grade}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{points}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-violet-50 border-t border-violet-100">
                  <td colSpan={2} className="px-4 py-3 font-bold text-slate-900">Semester Performance Index (SPI)</td>
                  <td colSpan={6} className="px-4 py-3 text-right font-extrabold text-violet-700 text-lg">
                    {currentSPI?.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Historical semesters ── */}
      {historical.map((sem) => (
        <div key={sem.sem} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h4 className="font-bold text-slate-900">Semester {sem.sem}</h4>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">SPI: {sem.spi.toFixed(1)}</span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-full">✓ Published</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  {['Code','Subject','Credits','Internal','External','Total','Grade'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sem.subjects.map((sub) => {
                  const total = sub.internal + sub.external;
                  const { grade, color } = getGrade(total);
                  return (
                    <tr key={sub.code} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-mono text-xs font-bold text-violet-600">{sub.code}</td>
                      <td className="px-4 py-2.5 text-slate-800 font-medium text-xs">{sub.name}</td>
                      <td className="px-4 py-2.5 text-center text-slate-500 text-xs">{sub.credits}</td>
                      <td className="px-4 py-2.5 text-center font-semibold text-slate-700 text-xs">{sub.internal}</td>
                      <td className="px-4 py-2.5 text-center font-semibold text-slate-700 text-xs">{sub.external}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-900 text-xs">{total}</td>
                      <td className="px-4 py-2.5">
                        <span className={clsx('inline-block px-2 py-0.5 rounded-full text-xs font-bold border', color)}>{grade}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* ══════════════════════════════════════════════════════════
           HIDDEN PDF CAPTURE AREA
           Rendered off-screen; captured by html2canvas for the PDF.
           Uses plain inline styles so html2canvas renders it reliably.
      ══════════════════════════════════════════════════════════ */}
      <div
        id="report-card-pdf"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '794px',           // A4 @ 96 dpi
          background: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          padding: '40px',
          boxSizing: 'border-box',
          color: '#0f172a',
        }}
      >
        {/* ── Letterhead ── */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid #1e293b', paddingBottom: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 52, height: 52, background: '#7c3aed', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 22 }}>PU</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: 22, color: '#1e293b', lineHeight: 1 }}>PRESENTIFY UNIVERSITY</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>Ahmedabad, Gujarat — 380009 · NAAC A++ Accredited</div>
            </div>
          </div>
          <div style={{ background: '#1e293b', color: '#fff', borderRadius: 8, padding: '8px 0', marginTop: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
              Academic Report Card — AY 2025-26
            </div>
          </div>
        </div>

        {/* ── Student details ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px', marginBottom: 24, fontSize: 12 }}>
          {[
            ['Student Name',   student.name],
            ['Roll Number',    student.rollNo],
            ['Branch',         student.branch],
            ['Semester',       `Semester ${student.semester}`],
            ['Section',        `Section ${student.section}`],
            ['Batch',          student.batch],
            ['CPI',            cpi.toFixed(2)],
            ['Generated On',   new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
              <span style={{ color: '#64748b', width: 120, flexShrink: 0 }}>{l}</span>
              <span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* ── SPI Summary table ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            SPI Summary
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#fff' }}>
                {['Semester', 'SPI', 'Status'].map(h => (
                  <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 700, fontSize: 11, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historical.map((sem, i) => (
                <tr key={sem.sem} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                  <td style={{ padding: '7px 10px', borderBottom: '1px solid #e2e8f0' }}>Semester {sem.sem}</td>
                  <td style={{ padding: '7px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#7c3aed' }}>{sem.spi.toFixed(2)}</td>
                  <td style={{ padding: '7px 10px', borderBottom: '1px solid #e2e8f0', color: '#16a34a', fontWeight: 600 }}>Published</td>
                </tr>
              ))}
              {currentSPI !== null && (
                <tr style={{ background: '#f5f3ff' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 700 }}>Semester {student.semester} (Current)</td>
                  <td style={{ padding: '7px 10px', fontWeight: 800, color: '#7c3aed', fontSize: 14 }}>{currentSPI.toFixed(2)}</td>
                  <td style={{ padding: '7px 10px', color: '#16a34a', fontWeight: 600 }}>Published</td>
                </tr>
              )}
              <tr style={{ background: '#7c3aed' }}>
                <td style={{ padding: '9px 10px', color: '#fff', fontWeight: 800 }}>Cumulative PI (CPI)</td>
                <td colSpan={2} style={{ padding: '9px 10px', color: '#fff', fontWeight: 900, fontSize: 16 }}>{cpi.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Current semester marks (if published) ── */}
        {sem4State?.published && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Semester {student.semester} — Subject-wise Marks
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#1e293b', color: '#fff' }}>
                  {['Code', 'Subject', 'Cr', 'Internal /30', 'External /70', 'Total /100', 'Grade', 'Points'].map(h => (
                    <th key={h} style={{ padding: '7px 8px', textAlign: 'left', fontWeight: 700, letterSpacing: 0.4 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBJECTS_SEM4.map((sub, i) => {
                  const m = sem4State.subjects[sub.code];
                  const iv = m?.internal ?? 0;
                  const ev = m?.external ?? 0;
                  const total = iv + ev;
                  const { grade, points } = getGrade(total);
                  return (
                    <tr key={sub.code} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 700, color: '#7c3aed', fontFamily: 'monospace', borderBottom: '1px solid #e2e8f0' }}>{sub.code}</td>
                      <td style={{ padding: '6px 8px', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>{sub.name}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>{sub.credits}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>{iv}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>{ev}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>{total}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, color: '#7c3aed', borderBottom: '1px solid #e2e8f0' }}>{grade}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>{points}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#ede9fe' }}>
                  <td colSpan={2} style={{ padding: '8px', fontWeight: 800, color: '#1e293b' }}>Semester Performance Index (SPI)</td>
                  <td colSpan={6} style={{ padding: '8px', textAlign: 'right', fontWeight: 900, fontSize: 16, color: '#7c3aed' }}>
                    {currentSPI?.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ── Historical semester marks ── */}
        {historical.map((sem) => (
          <div key={sem.sem} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Semester {sem.sem} — Subject-wise Marks
              </div>
              <span style={{ background: '#ede9fe', color: '#7c3aed', fontWeight: 700, fontSize: 11, padding: '2px 10px', borderRadius: 20 }}>
                SPI: {sem.spi.toFixed(2)}
              </span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#334155', color: '#fff' }}>
                  {['Code', 'Subject', 'Cr', 'Internal', 'External', 'Total', 'Grade'].map(h => (
                    <th key={h} style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sem.subjects.map((sub, i) => {
                  const total = sub.internal + sub.external;
                  const { grade } = getGrade(total);
                  return (
                    <tr key={sub.code} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                      <td style={{ padding: '5px 8px', fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed', borderBottom: '1px solid #f1f5f9' }}>{sub.code}</td>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9' }}>{sub.name}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>{sub.credits}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{sub.internal}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{sub.external}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 800, borderBottom: '1px solid #f1f5f9' }}>{total}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 800, color: '#7c3aed', borderBottom: '1px solid #f1f5f9' }}>{grade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {/* ── Footer ── */}
        <div style={{ marginTop: 32, borderTop: '2px solid #1e293b', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 10, color: '#64748b' }}>
          <div>
            <p>Generated on {new Date().toLocaleString('en-IN')}</p>
            <p>This is a computer-generated report. No signature required.</p>
            <p>Verify at: presentify.edu.in/verify · Roll No: {student.rollNo}</p>
          </div>
          <div style={{ textAlign: 'right', borderTop: '1px solid #94a3b8', paddingTop: 8, paddingLeft: 32 }}>
            <p style={{ fontWeight: 700, color: '#1e293b' }}>Controller of Examinations</p>
            <p>Presentify University</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function SummaryCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'violet' | 'amber' | 'slate';
}) {
  const colors = {
    blue:    { bg: 'bg-blue-50 border-blue-200',       ic: 'text-blue-600',    val: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50 border-emerald-200', ic: 'text-emerald-600', val: 'text-emerald-700' },
    violet:  { bg: 'bg-violet-50 border-violet-200',   ic: 'text-violet-600',  val: 'text-violet-700' },
    amber:   { bg: 'bg-amber-50 border-amber-200',     ic: 'text-amber-600',   val: 'text-amber-700' },
    slate:   { bg: 'bg-slate-50 border-slate-200',     ic: 'text-slate-600',   val: 'text-slate-700' },
  };
  const c = colors[color];
  return (
    <div className={`bg-white rounded-xl border ${c.bg.split(' ')[1]} p-5`}>
      <div className={`w-9 h-9 rounded-lg border ${c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${c.ic}`} />
      </div>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className={`font-extrabold text-xl ${c.val}`}>{value}</p>
      <p className="text-slate-400 text-xs mt-1">{sub}</p>
    </div>
  );
}
