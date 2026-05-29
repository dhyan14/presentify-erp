'use client';

import { useApp, StudentUser } from '@/context/AppContext';
import { MOCK_MARKS_INITIAL, MOCK_SUBJECTS_SEM4 } from '@/lib/mockData';
import { getGrade, calculateSPI } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, BookOpen, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function ReportCard() {
  const { state } = useApp();
  const student   = state.currentUser as StudentUser;
  const sem4State = state.marks[student.rollNo]?.sem4;
  const historical = MOCK_MARKS_INITIAL.STU202601.historicalSemesters;

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

  return (
    <div className="space-y-6">
      {/* ── Summary row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Cumulative PI"
          value={cpi.toFixed(2)}
          sub="Based on published semesters"
          icon={TrendingUp}
          color="blue"
        />
        {historical.slice(-1).map((s) => (
          <SummaryCard
            key={s.sem}
            label={`Sem ${s.sem} SPI`}
            value={s.spi.toFixed(1)}
            sub="Last completed semester"
            icon={Award}
            color="emerald"
          />
        ))}
        <SummaryCard
          label="Current Semester"
          value={sem4State?.published ? 'Published' : 'Awaited'}
          sub={`Sem ${student.semester} results`}
          icon={sem4State?.published ? Award : Clock}
          color={sem4State?.published ? 'violet' : 'amber'}
        />
        <SummaryCard
          label="Completed Semesters"
          value={completedSPIs.length.toString()}
          sub={`of 8 total semesters`}
          icon={BookOpen}
          color="slate"
        />
      </div>

      {/* ── SPI trend chart ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" /> SPI Trend Chart
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
                <Cell
                  key={i}
                  fill={entry.spi === null ? '#e2e8f0' : entry.spi >= 9 ? '#8b5cf6' : entry.spi >= 8 ? '#3b82f6' : '#10b981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 justify-center mt-2 text-xs text-slate-500">
          {[['#8b5cf6','SPI ≥ 9.0'],['#3b82f6','SPI ≥ 8.0'],['#10b981','SPI < 8.0'],['#e2e8f0','Pending']].map(([color,label])=>(
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{background:color}} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Current Semester (Sem 4) marks ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">Semester {student.semester} — Report Card</h3>
            <p className="text-slate-400 text-sm mt-0.5">AY 2025-26 &middot; {student.branchCode}</p>
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
              Your Semester {student.semester} marks have not been published yet by the faculty. Check back after the examination.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['Code','Subject','Credits','Internal /30','External /70','Total /100','Grade','Points'].map(h=>(
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
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{sub.code}</td>
                      <td className="px-4 py-3 text-slate-900 font-medium">{sub.name}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{sub.credits}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-900">{internalVal}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-900">{externalVal}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-900">{total}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx('inline-block px-2.5 py-1 rounded-full text-xs font-bold border', color)}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{points}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 border-t border-blue-100">
                  <td colSpan={2} className="px-4 py-3 font-bold text-slate-900">Semester Performance Index (SPI)</td>
                  <td colSpan={6} className="px-4 py-3 text-right font-extrabold text-blue-700 text-lg">
                    {(() => {
                      const subs = MOCK_SUBJECTS_SEM4.map((sub) => {
                        const m = sem4State.subjects[sub.code];
                        return { credits: sub.credits, internal: m?.internal ?? 0, external: m?.external ?? 0 };
                      });
                      return calculateSPI(subs).toFixed(2);
                    })()}
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
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                SPI: {sem.spi.toFixed(1)}
              </span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-full">
                ✓ Published
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  {['Code','Subject','Credits','Internal','External','Total','Grade'].map(h=>(
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
                      <td className="px-4 py-2.5 font-mono text-xs font-bold text-blue-600">{sub.code}</td>
                      <td className="px-4 py-2.5 text-slate-800 font-medium text-xs">{sub.name}</td>
                      <td className="px-4 py-2.5 text-center text-slate-500 text-xs">{sub.credits}</td>
                      <td className="px-4 py-2.5 text-center font-semibold text-slate-700 text-xs">{sub.internal}</td>
                      <td className="px-4 py-2.5 text-center font-semibold text-slate-700 text-xs">{sub.external}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-900 text-xs">{total}</td>
                      <td className="px-4 py-2.5">
                        <span className={clsx('inline-block px-2 py-0.5 rounded-full text-xs font-bold border', color)}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'violet' | 'amber' | 'slate';
}) {
  const colors = {
    blue:    { bg: 'bg-blue-50 border-blue-200',    ic: 'text-blue-600',    val: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50 border-emerald-200', ic: 'text-emerald-600', val: 'text-emerald-700' },
    violet:  { bg: 'bg-violet-50 border-violet-200',  ic: 'text-violet-600',  val: 'text-violet-700' },
    amber:   { bg: 'bg-amber-50 border-amber-200',    ic: 'text-amber-600',   val: 'text-amber-700' },
    slate:   { bg: 'bg-slate-50 border-slate-200',    ic: 'text-slate-600',   val: 'text-slate-700' },
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
