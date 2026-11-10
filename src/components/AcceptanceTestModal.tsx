import React, { useState } from 'react';
import { Language, translations } from '../i18n/translations';
import { CheckCircle2, XCircle, Loader2, Play, ShieldAlert, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onTestComplete: () => void;
}

interface TestStep {
  stepNumber: number;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  details: string;
  durationMs: number;
}

export const AcceptanceTestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onTestComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  if (!isOpen) return null;

  const runTest = async () => {
    setIsRunning(true);
    setError(null);
    setSteps([]);
    setSummary(null);

    try {
      const res = await fetch('/api/acceptance-test/run', { 
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json().catch(() => ({ success: false, error: 'Malformed response from test runner' }));

      if (data.success) {
        setSteps(data.steps);
        setSummary(data.summary);
        onTestComplete();
      } else {
        setSteps(data.steps || []);
        setError(data.error || 'Acceptance test failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error running acceptance test');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'اختبار القبول النهائي الشامل (9 خطوات)' : 'Final Acceptance Test Runner (9 Steps)'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar' 
                ? 'التحقق الواقعي من سلسلة: الاكتشاف ← الضمان ← سياسة البوتات ← أهلية الجزائر ← التنفيذ الذاتي ← التسليم ← القبول ← الدفع الحقيقي ← قيد الدفتر'
                : 'Verifies the authentic end-to-end pipeline: Discovery → Escrow → Bot Policy → Algeria Eligibility → AI Execution → Submission → Acceptance → Actual Payment → Ledger Reconciliation.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps display */}
        <div className="py-4 space-y-3 overflow-y-auto flex-1">
          {steps.length === 0 && !isRunning && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-6 text-center text-xs text-slate-400">
              <p className="mb-4">
                {lang === 'ar'
                  ? 'اضغط أدناه لبدء التسلسل الفعلي الكامل لاختبار المحرك ضد المهام الممولة الحقيقية والتحقق المالي الموثق.'
                  : 'Click below to initiate the authentic end-to-end acceptance test against real funded tasks and verified financial settlements.'}
              </p>
              <button
                onClick={runTest}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'ar' ? 'بدء تشغيل الاختبار الآن' : 'Start Full Acceptance Test'}</span>
              </button>
            </div>
          )}

          {isRunning && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <div className="text-xs font-semibold text-slate-200">
                {lang === 'ar' ? 'جاري تنفيذ خطوات التحقق الذاتي...' : 'Executing autonomous pipeline verification...'}
              </div>
              <div className="text-2xs text-slate-500 mt-1">
                {lang === 'ar' ? 'استدعاء الذكاء الاصطناعي، التحقق من الضمان، وإثبات الدفع المصرفي' : 'Querying APIs, Gemini 3.8 Flash, and verifying bank clearing.'}
              </div>
            </div>
          )}

          {steps.map((st) => (
            <div
              key={st.stepNumber}
              className={`rounded-lg border p-3 text-xs transition-colors ${
                st.status === 'passed'
                  ? 'border-emerald-500/20 bg-emerald-950/20'
                  : 'border-rose-500/20 bg-rose-950/20'
              }`}
            >
              <div className="flex items-center justify-between font-medium">
                <div className="flex items-center gap-2">
                  {st.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="text-slate-200 font-semibold">
                    {st.stepNumber}. {st.name}
                  </span>
                </div>
                <span className="text-2xs font-mono text-slate-400 tabular-nums">
                  {st.durationMs}ms
                </span>
              </div>
              <p className="mt-1.5 ps-6 text-2xs text-slate-300 font-mono">
                {st.details}
              </p>
            </div>
          ))}

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{lang === 'ar' ? 'فشل الخطوة:' : 'Step Failure:'} </span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {summary && (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs">
              <div className="font-semibold text-cyan-300 mb-2">
                {lang === 'ar' ? 'ملخص تسوية الدفتر المالي المحقق:' : 'Reconciled Financial Ledger Status:'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs font-mono tabular-nums">
                <div className="rounded-sm bg-slate-900/80 p-2">
                  <div className="text-slate-400">{lang === 'ar' ? 'معلن' : 'Advertised'}</div>
                  <div className="text-slate-200 font-bold">${summary.advertisedRewardsUsd.toFixed(2)}</div>
                </div>
                <div className="rounded-sm bg-slate-900/80 p-2">
                  <div className="text-slate-400">{lang === 'ar' ? 'معلق' : 'Pending'}</div>
                  <div className="text-slate-200 font-bold">${summary.pendingRewardsUsd.toFixed(2)}</div>
                </div>
                <div className="rounded-sm bg-slate-900/80 p-2">
                  <div className="text-slate-400">{lang === 'ar' ? 'مستلم حقيقي' : 'Received'}</div>
                  <div className="text-emerald-400 font-bold">${summary.paymentsReceivedUsd.toFixed(2)}</div>
                </div>
                <div className="rounded-sm bg-slate-900/80 p-2">
                  <div className="text-slate-400">{lang === 'ar' ? 'قابل للسحب' : 'Withdrawable'}</div>
                  <div className="text-cyan-400 font-bold">${summary.withdrawableBalanceUsd.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
          {steps.length > 0 && !isRunning && (
            <button
              onClick={runTest}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'ar' ? 'إعادة الاختبار' : 'Re-run Test'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
