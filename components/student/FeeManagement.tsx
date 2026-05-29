'use client';

import { useState } from 'react';
import { useApp, StudentUser, FeeItem } from '@/context/AppContext';
import {
  CreditCard, CheckCircle2, AlertCircle, Download, X,
  Smartphone, Building2, Globe, Lock,
} from 'lucide-react';
import { formatINR, generateReceiptNo, generateTransactionId } from '@/lib/utils';
import clsx from 'clsx';

type PaymentTab = 'upi' | 'card' | 'netbanking';
type PayState   = 'idle' | 'processing' | 'success';

export default function FeeManagement() {
  const { state, dispatch } = useApp();
  const student = state.currentUser as StudentUser;
  const fees    = state.fees[student.rollNo];

  const [showPayModal,  setShowPayModal]  = useState(false);
  const [payTab,        setPayTab]        = useState<PaymentTab>('upi');
  const [payState,      setPayState]      = useState<PayState>('idle');
  const [showReceipt,   setShowReceipt]   = useState(false);
  const [receiptSnap,   setReceiptSnap]   = useState<{ receiptNo: string; transactionId: string; paidAt: string } | null>(null);

  const total       = fees.items.reduce((s, i) => s + i.amount, 0);
  const paid        = fees.items.filter((i) => i.paid).reduce((s, i) => s + i.amount, 0);
  const outstanding = total - paid;
  const allPaid     = outstanding === 0;

  // ── Simulate payment gateway ──
  const handleConfirmPay = async () => {
    setPayState('processing');
    await new Promise((res) => setTimeout(res, 2200));
    const rNo = generateReceiptNo('PRES');
    const tId = generateTransactionId();
    dispatch({ type: 'PAY_FEES', payload: { studentId: student.rollNo, receiptNo: rNo, transactionId: tId } });
    setReceiptSnap({ receiptNo: rNo, transactionId: tId, paidAt: new Date().toISOString() });
    setPayState('success');
  };

  const openReceipt = () => {
    const snap = receiptSnap ?? {
      receiptNo:     fees.receiptNo!,
      transactionId: fees.transactionId!,
      paidAt:        fees.paidAt!,
    };
    setReceiptSnap(snap);
    setShowReceipt(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Summary cards ── */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total Amount"        value={formatINR(total)}       sub={`AY ${fees.academicYear} · Sem ${fees.semester}`}    color="slate" />
        <StatCard label="Amount Paid"         value={formatINR(paid)}        sub={`${fees.items.filter(i=>i.paid).length}/${fees.items.length} items`} color="emerald" />
        <StatCard
          label="Outstanding Balance"
          value={formatINR(outstanding)}
          sub={allPaid ? '✓ All dues cleared' : `Due: ${new Date(fees.dueDate).toLocaleDateString('en-IN')}`}
          color={allPaid ? 'emerald' : 'amber'}
        />
      </div>

      {/* ── Fee breakdown ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Fee Breakdown — AY {fees.academicYear}</h3>
          {allPaid && (
            <button
              onClick={openReceipt}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              <Download className="w-4 h-4" /> View Receipt
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Component</th>
                <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Amount (INR)</th>
                <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.items.map((item: FeeItem) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className={clsx('w-2 h-2 rounded-full', item.paid ? 'bg-emerald-500' : 'bg-amber-500')} />
                      <span className="font-medium text-slate-900">{item.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatINR(item.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    {item.paid ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Unpaid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td className="px-6 py-4 font-extrabold text-slate-900">Total</td>
                <td className="px-6 py-4 text-right font-extrabold text-slate-900 text-base">{formatINR(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {!allPaid && (
          <div className="px-6 py-5 border-t border-slate-100 bg-amber-50/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-slate-700 text-sm font-semibold">
                Balance due: <span className="text-amber-600 font-extrabold">{formatINR(outstanding)}</span>
              </p>
              <p className="text-slate-400 text-xs mt-0.5">Secured via Presentify Pay Gateway &middot; RBI compliant</p>
            </div>
            <button
              id="btn-pay-now"
              onClick={() => { setPayState('idle'); setShowPayModal(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/30"
            >
              <CreditCard className="w-4 h-4" /> Pay Now
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════ PAYMENT MODAL ══════════════════ */}
      {showPayModal && (
        <Modal onClose={() => { if (payState !== 'processing') setShowPayModal(false); }}>
          {payState === 'idle' && (
            <>
              <ModalHeader
                title="Complete Payment"
                subtitle="Presentify Pay — Secured Gateway"
                onClose={() => setShowPayModal(false)}
              />
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                <p className="text-blue-500 text-xs font-semibold uppercase tracking-wider">Amount Payable</p>
                <p className="text-blue-900 text-3xl font-extrabold mt-0.5">{formatINR(outstanding)}</p>
              </div>
              <div className="p-6 space-y-5">
                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {([['upi','UPI',Smartphone],['card','Card',CreditCard],['netbanking','Net Banking',Building2]] as const).map(([id,label,Icon]) => (
                    <button
                      key={id}
                      onClick={() => setPayTab(id as PaymentTab)}
                      className={clsx(
                        'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all',
                        payTab === id
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <Icon className="w-4 h-4" />{label}
                    </button>
                  ))}
                </div>

                {payTab === 'upi' && (
                  <input
                    type="text" defaultValue="arjun.sharma@oksbi" placeholder="Enter UPI ID"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
                {payTab === 'card' && (
                  <div className="space-y-3">
                    <input type="text" defaultValue="4111 1111 1111 1111" className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" defaultValue="12/28" placeholder="MM/YY" className="px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                      <input type="password" defaultValue="***" placeholder="CVV" className="px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}
                {payTab === 'netbanking' && (
                  <div className="grid grid-cols-3 gap-2">
                    {['SBI','HDFC','ICICI','Axis','PNB','BoB'].map(b => (
                      <button key={b} className="py-3 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:border-blue-400 hover:bg-blue-50 transition-all">{b}</button>
                    ))}
                  </div>
                )}

                <button
                  id="btn-confirm-pay"
                  onClick={handleConfirmPay}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Confirm &amp; Pay {formatINR(outstanding)}
                </button>
                <p className="text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> 256-bit SSL encrypted · RBI compliant demo gateway
                </p>
              </div>
            </>
          )}

          {payState === 'processing' && (
            <div className="p-14 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-slate-900 font-bold text-lg">Processing Payment</h3>
                <p className="text-slate-500 text-sm mt-1">Verifying with payment gateway…</p>
                <p className="text-slate-400 text-xs mt-1">Do not close this window</p>
              </div>
            </div>
          )}

          {payState === 'success' && (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-xl">Payment Successful!</h3>
                <p className="text-slate-500 text-sm mt-1">
                  TXN ID: <span className="font-mono font-bold text-slate-900">{receiptSnap?.transactionId}</span>
                </p>
                <p className="text-slate-500 text-sm">
                  Receipt: <span className="font-mono font-bold text-slate-900">{receiptSnap?.receiptNo}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPayModal(false); setPayState('idle'); setShowReceipt(true); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all"
                >
                  <Download className="w-4 h-4" /> View Receipt
                </button>
                <button
                  onClick={() => { setShowPayModal(false); setPayState('idle'); }}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ══════════════════ RECEIPT MODAL ══════════════════ */}
      {showReceipt && receiptSnap && (
        <Modal onClose={() => setShowReceipt(false)}>
          <div className="no-print px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Fee Payment Receipt</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Download className="w-4 h-4" /> Print / PDF
              </button>
              <button onClick={() => setShowReceipt(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6" id="receipt-content">
            {/* Letterhead */}
            <div className="text-center border-b border-slate-200 pb-5">
              <div className="flex items-center justify-center gap-2.5 mb-1">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">P</span>
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-extrabold text-slate-900">Presentify University</h2>
                  <p className="text-slate-400 text-xs">Ahmedabad, Gujarat — 380009 &middot; NAAC A++ Accredited</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-semibold mt-2 uppercase tracking-wider">Fee Payment Receipt</p>
            </div>

            <div className="space-y-2">
              {[
                ['Receipt No.',          receiptSnap.receiptNo],
                ['Transaction ID',       receiptSnap.transactionId],
                ['Date & Time',          new Date(receiptSnap.paidAt).toLocaleString('en-IN')],
                ['Student Name',         student.name],
                ['Roll Number',          student.rollNo],
                ['Branch & Semester',    `${student.branchCode} — Sem ${student.semester}`],
                ['Academic Year',        fees.academicYear],
                ['Payment Mode',         payTab === 'upi' ? 'UPI' : payTab === 'card' ? 'Debit/Credit Card' : 'Net Banking'],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">{l}</span>
                  <span className="font-mono font-bold text-slate-900">{v}</span>
                </div>
              ))}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Fee Component</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fees.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-slate-700">{item.label}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatINR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td className="px-4 py-3 font-extrabold text-slate-900">Total Paid</td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-600 text-base">{formatINR(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="text-center">
              <p className="text-emerald-600 font-semibold text-sm flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Payment verified &amp; recorded
              </p>
              <p className="text-slate-400 text-xs mt-1">System-generated receipt. No signature required.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Shared sub-components ──

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: 'slate' | 'emerald' | 'amber' }) {
  const styles = {
    slate:   'bg-white border-slate-200 text-slate-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber:   'bg-amber-50 border-amber-200 text-amber-700',
  };
  return (
    <div className={`rounded-xl border p-5 ${styles[color]}`}>
      <p className="text-xs text-current opacity-60 mb-1">{label}</p>
      <p className={`text-2xl font-extrabold`}>{value}</p>
      <p className="text-xs mt-1 opacity-60">{sub}</p>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
