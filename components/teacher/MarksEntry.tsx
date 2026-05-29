'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MOCK_STUDENTS_SEM4,
  MOCK_SUBJECTS_SEM4,
  MOCK_PREFILLED_MARKS,
} from '@/lib/mockData';
import { getGrade, sanitizeNumericInput } from '@/lib/utils';
import { Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function MarksEntry() {
  const { state, dispatch } = useApp();
  const sem4Marks = state.marks['STU202601']?.sem4;
  const isPublished = sem4Marks?.published ?? false;

  const [showConfirm, setShowConfirm] = useState(false);
  const [published,   setPublished]   = useState(false);

  // Per-cell error state: `${rollNo}-${code}-${type}` → error msg
  const [cellErrors, setCellErrors] = useState<Record<string, string>>({});

  const handleMarkChange = (
    rollNo: string,
    code: string,
    type: 'internal' | 'external',
    rawValue: string
  ) => {
    if (rollNo !== 'STU202601') return; // only demo student updates context
    const max = type === 'internal' ? 30 : 70;
    const key = `${rollNo}-${code}-${type}`;
    if (rawValue === '') {
      dispatch({ type: 'UPDATE_MARK', payload: { studentId: rollNo, subjectCode: code, markType: type, value: null } });
      setCellErrors((p) => { const n = { ...p }; delete n[key]; return n; });
      return;
    }
    const val = sanitizeNumericInput(rawValue, 0, max);
    if (val === null) {
      setCellErrors((p) => ({ ...p, [key]: `0–${max}` }));
    } else {
      dispatch({ type: 'UPDATE_MARK', payload: { studentId: rollNo, subjectCode: code, markType: type, value: val } });
      setCellErrors((p) => { const n = { ...p }; delete n[key]; return n; });
    }
  };

  const handlePublish = () => {
    dispatch({ type: 'PUBLISH_MARKS' });
    setPublished(true);
    setShowConfirm(false);
  };

  // Build rows: demo student (from context) + prefilled others
  const rows = MOCK_STUDENTS_SEM4.map((stu) => {
    const isDemo = stu.rollNo === 'STU202601';
    const subjectMarks = isDemo
      ? sem4Marks?.subjects ?? {}
      : MOCK_PREFILLED_MARKS[stu.rollNo] ?? {};
    return { ...stu, isDemo, subjectMarks };
  });

  return (
    <div className="space-y-6">
      {/* ── Status banner ── */}
      {isPublished && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-emerald-800 font-bold">Marks Published Successfully</p>
            <p className="text-emerald-600 text-sm">
              Sem {state.marks.STU202601?.sem4?.published ? '4' : '?'} marks are now visible in student Report Cards.
            </p>
          </div>
        </div>
      )}

      {published && !isPublished && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-emerald-800 font-bold">Marks published! Switch to Student account to see the Report Card.</p>
        </div>
      )}

      {/* ── Control bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900">Marks Entry Grid</h3>
          <p className="text-slate-400 text-sm mt-0.5">CSE — Semester 4 &middot; Batch 2026 &middot; Section A</p>
        </div>

        <div className="flex items-center gap-3">
          {Object.keys(cellErrors).length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {Object.keys(cellErrors).length} validation error(s)
            </div>
          )}
          <button
            id="btn-save-draft"
            className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            id="btn-lock-publish"
            onClick={() => setShowConfirm(true)}
            disabled={isPublished}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
              isPublished
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
            )}
          >
            <Lock className="w-4 h-4" />
            {isPublished ? 'Already Published' : 'Lock & Publish'}
          </button>
        </div>
      </div>

      {/* ── Spreadsheet grid ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Roll No.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Student Name</th>
                {MOCK_SUBJECTS_SEM4.map((sub) => (
                  <th key={sub.code} colSpan={3} className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide border-l border-slate-700">
                    {sub.code}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-800 text-slate-300 text-xs">
                <th className="px-4 py-2" />
                <th className="px-4 py-2" />
                {MOCK_SUBJECTS_SEM4.map((sub) => (
                  <>
                    <th key={`${sub.code}-i`} className="px-2 py-2 text-center border-l border-slate-700 font-medium">Int /30</th>
                    <th key={`${sub.code}-e`} className="px-2 py-2 text-center font-medium">Ext /70</th>
                    <th key={`${sub.code}-g`} className="px-2 py-2 text-center font-medium">Grade</th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((stu, ri) => (
                <tr key={stu.rollNo} className={clsx('hover:bg-slate-50/60', ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600 whitespace-nowrap">{stu.rollNo}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    {stu.name}
                    {stu.isDemo && (
                      <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-200 font-bold">
                        DEMO
                      </span>
                    )}
                  </td>

                  {MOCK_SUBJECTS_SEM4.map((sub) => {
                    const marks = stu.subjectMarks as Record<string, { internal: number | null; external: number | null }>;
                    const m = marks[sub.code] ?? { internal: null, external: null };
                    const intVal = m.internal;
                    const extVal = m.external;
                    const total = intVal !== null && extVal !== null ? intVal + extVal : null;
                    const { grade, color } = total !== null ? getGrade(total) : { grade: '—', color: 'text-slate-400 bg-slate-100 border-slate-200' };

                    const intKey = `${stu.rollNo}-${sub.code}-internal`;
                    const extKey = `${stu.rollNo}-${sub.code}-external`;

                    return (
                      <>
                        {/* Internal */}
                        <td key={intKey} className="px-2 py-2 border-l border-slate-100">
                          {stu.isDemo && !isPublished ? (
                            <div>
                              <input
                                type="number"
                                min={0} max={30}
                                value={intVal ?? ''}
                                placeholder="—"
                                onChange={(e) => handleMarkChange(stu.rollNo, sub.code, 'internal', e.target.value)}
                                className={clsx(
                                  'w-14 text-center text-sm font-semibold border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 transition-all',
                                  cellErrors[intKey] ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-blue-300'
                                )}
                              />
                              {cellErrors[intKey] && (
                                <p className="text-red-500 text-[10px] text-center mt-0.5">{cellErrors[intKey]}</p>
                              )}
                            </div>
                          ) : (
                            <span className="block text-center text-sm font-semibold text-slate-900">
                              {intVal ?? '—'}
                            </span>
                          )}
                        </td>

                        {/* External */}
                        <td key={extKey} className="px-2 py-2">
                          {stu.isDemo && !isPublished ? (
                            <div>
                              <input
                                type="number"
                                min={0} max={70}
                                value={extVal ?? ''}
                                placeholder="—"
                                onChange={(e) => handleMarkChange(stu.rollNo, sub.code, 'external', e.target.value)}
                                className={clsx(
                                  'w-14 text-center text-sm font-semibold border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 transition-all',
                                  cellErrors[extKey] ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-blue-300'
                                )}
                              />
                              {cellErrors[extKey] && (
                                <p className="text-red-500 text-[10px] text-center mt-0.5">{cellErrors[extKey]}</p>
                              )}
                            </div>
                          ) : (
                            <span className="block text-center text-sm font-semibold text-slate-900">
                              {extVal ?? '—'}
                            </span>
                          )}
                        </td>

                        {/* Grade */}
                        <td key={`${stu.rollNo}-${sub.code}-grade`} className="px-2 py-2 text-center">
                          <span className={clsx('inline-block px-2 py-0.5 rounded-full text-xs font-bold border', color)}>
                            {grade}
                          </span>
                        </td>
                      </>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
          ℹ︎ Internal: 0–30 marks · External: 0–70 marks · Total: 0–100 marks · Grades auto-calculated
        </div>
      </div>

      {/* ── Confirm publish modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center space-y-5">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-slate-900 font-extrabold text-xl">Lock &amp; Publish Marks?</h3>
              <p className="text-slate-500 text-sm mt-2">
                This action will <strong>publish all marks</strong> for CSE Sem 4 — Section A to student portals. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePublish}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all"
              >
                ✓ Confirm &amp; Publish
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 py-3 rounded-xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
