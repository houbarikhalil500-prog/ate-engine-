import React, { useState } from 'react';
import { TaskRecord, LedgerEntry } from '../types';
import { Language, translations } from '../i18n/translations';
import { 
  Receipt, 
  ShieldCheck, 
  Building2, 
  FileCheck, 
  AlertCircle, 
  PlusCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';

interface Props {
  tasks: TaskRecord[];
  ledgerEntries: LedgerEntry[];
  lang: Language;
  onVerifyPayment: (payload: {
    taskId: string;
    verificationMethod: any;
    settlementReference: string;
    amount: number;
    currency: string;
  }) => Promise<void>;
  onRefresh: () => void;
}

export const VerifiedPaymentsPage: React.FC<Props> = ({
  tasks,
  ledgerEntries,
  lang,
  onVerifyPayment,
  onRefresh,
}) => {
  const t = translations[lang];
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [method, setMethod] = useState<'bank_wire' | 'stripe_transfer' | 'wise_payout'>('bank_wire');
  const [settlementRef, setSettlementRef] = useState('');
  const [amount, setAmount] = useState<number>(150);
  const [currency, setCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter ledger for payments received
  const payments = ledgerEntries.filter((e) => e.entryType === 'payment_received');
  const pendingOrAcceptedTasks = tasks.filter(
    (t) => t.executionStatus === 'accepted' || t.executionStatus === 'submitted'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setFormError(lang === 'ar' ? 'يرجى اختيار المهمة' : 'Please select a task');
      return;
    }
    if (!settlementRef || settlementRef.trim().length < 5) {
      setFormError(lang === 'ar' ? 'يرجى إدخال رقم إشعار التسوية المصرفية الصحيح' : 'Please provide a valid settlement reference');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await onVerifyPayment({
        taskId: selectedTaskId,
        verificationMethod: method,
        settlementReference: settlementRef.trim(),
        amount: Number(amount),
        currency,
      });
      setShowVerifyModal(false);
      setSettlementRef('');
    } catch (err: any) {
      setFormError(err?.message || 'Verification error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>{t.nav.payments}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'سجل المدفوعات المستقلة الموثقة عبر تحويلات مصرفية قانونية، مع حظر المعاملات الوهمية والعملات غير المرخصة.'
              : 'Independently verified fiat settlements. Strictly zero fabricated transaction hashes or simulated earnings.'}
          </p>
        </div>

        <button
          onClick={() => {
            if (pendingOrAcceptedTasks.length > 0) {
              setSelectedTaskId(pendingOrAcceptedTasks[0].id);
              setAmount(pendingOrAcceptedTasks[0].rewardAmount);
            }
            setShowVerifyModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{lang === 'ar' ? 'توثيق تسوية بنكية جديدة' : 'Verify Settlement Receipt'}</span>
        </button>
      </div>

      {/* Compliance Notice */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400 flex items-start gap-3">
        <Building2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200">
            {lang === 'ar' ? 'الامتثال المصرفي للجمهورية الجزائرية' : 'Bank Settlement & Algeria Jurisdiction Compliance'}
          </div>
          <p className="text-2xs text-slate-400 leading-relaxed">
            {t.ledger.algeriaComplianceNote} {t.ledger.noFabricationNotice}
          </p>
        </div>
      </div>

      {/* Verified Settlements Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {lang === 'ar' ? 'المدفوعات الموثقة مصرفياً' : 'Verified Payout Settlements'}
          </h2>
          <span className="text-2xs text-slate-400 font-mono">
            {payments.length} {lang === 'ar' ? 'عملية موثقة' : 'verified settlements'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-2xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.ledger.date}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'المهمة / المستند' : 'Task / Evidence'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'قناة التحويل' : 'Payment Channel'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'رقم الإشعار البنكي' : 'Settlement Reference'}</th>
                <th className="py-3 px-4 text-right">{t.ledger.amount}</th>
                <th className="py-3 px-4 text-center">{t.ledger.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-4 text-slate-400 text-2xs tabular-nums">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-sans">
                    <div className="font-semibold">{p.taskTitle || 'Direct Task Settlement'}</div>
                    <div className="text-2xs text-slate-500 font-mono">Counterparty: {p.counterparty}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-2xs">
                    <span className="rounded-sm bg-slate-800 px-2 py-0.5 border border-slate-700">
                      {p.verificationMethod?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-cyan-400 text-2xs select-all">
                    {p.verificationEvidence || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400 tabular-nums text-sm">
                    +${p.amount.toFixed(2)} {p.currency}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 text-2xs text-emerald-400 font-sans font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'موثق' : 'Verified'}</span>
                    </span>
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans text-xs">
                    {lang === 'ar'
                      ? 'لا توجد مدفوعات مستلمة بعد. يتم قيد المبالغ حصراً بعد توثيق التسوية البنكية المستقلة.'
                      : 'No payments verified yet. Funds are logged strictly upon authentic bank settlement proof.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ar' ? 'توثيق إشعار تسوية مصرفية' : 'Record Verified Bank Settlement'}</span>
              </h2>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-2xs font-semibold text-slate-300 mb-1">
                  {lang === 'ar' ? 'اختر المهمة المقبولة' : 'Select Accepted Task'}
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => {
                    setSelectedTaskId(e.target.value);
                    const tItem = tasks.find((t) => t.id === e.target.value);
                    if (tItem) setAmount(tItem.rewardAmount);
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-hidden"
                >
                  <option value="">-- {lang === 'ar' ? 'اختر مهمة' : 'Select a task'} --</option>
                  {tasks.map((tk) => (
                    <option key={tk.id} value={tk.id}>
                      [{tk.providerId}] {tk.title} (${tk.rewardAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-300 mb-1">
                  {lang === 'ar' ? 'طريقة التحقق المصرفي' : 'Verification Method'}
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-hidden"
                >
                  <option value="bank_wire">Bank Wire / SWIFT (Direct to Algerian Bank)</option>
                  <option value="stripe_transfer">Stripe Connect Payout</option>
                  <option value="wise_payout">Wise Multi-Currency Payout</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-300 mb-1">
                  {lang === 'ar' ? 'رقم الإشعار أو المستند البنكي' : 'Bank Settlement Document Reference'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WIRE-DZ-BNA-20261109-88412"
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-hidden"
                />
                <span className="text-3xs text-slate-500 mt-1 block">
                  {lang === 'ar' ? 'إثبات بنكي مستقل إلزامي لمنع التزييف' : 'Independent verification reference is mandatory'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">
                    {lang === 'ar' ? 'المبلغ المستلم' : 'Amount Received'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-slate-300 mb-1">
                    {lang === 'ar' ? 'العملة' : 'Currency'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currency}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/50 p-2 text-xs font-mono text-slate-400"
                  />
                </div>
              </div>

              {formError && (
                <div className="text-2xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg p-2.5">
                  {formError}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                >
                  {isSubmitting ? (lang === 'ar' ? 'جاري القيد...' : 'Verifying...') : (lang === 'ar' ? 'توثيق وقيد بالدفتر' : 'Verify & Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
