import React, { useState } from 'react';
import { TaskRecord, ExecutionRecord } from '../types';
import { Language, translations } from '../i18n/translations';
import { Send, CheckCircle2, Clock, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';

interface Props {
  tasks: TaskRecord[];
  executions: ExecutionRecord[];
  lang: Language;
  onSimulateAcceptance: (task: TaskRecord) => void;
  onVerifyPayment: (task: TaskRecord) => void;
  onRefresh: () => void;
}

export const SubmissionsPage: React.FC<Props> = ({
  tasks,
  executions,
  lang,
  onSimulateAcceptance,
  onVerifyPayment,
  onRefresh,
}) => {
  const t = translations[lang];
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const submittedTasks = tasks.filter(
    (t) => 
      t.executionStatus === 'submitted' || 
      t.executionStatus === 'accepted' || 
      t.executionStatus === 'payment_verified'
  );

  const handleAcceptance = async (task: TaskRecord) => {
    setLoadingTaskId(task.id);
    await onSimulateAcceptance(task);
    setLoadingTaskId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-cyan-400" />
            <span>{t.nav.submissions}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'تتبع طلبات السحب (Pull Requests) المرسلة ومتابعة قبول مشرفي المشاريع المفتوحة قبل صرف المكافآت.'
              : 'Tracking dispatched pull requests, webhook bundles, and provider maintainer review acceptances.'}
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.actions.refresh}</span>
        </button>
      </div>

      <div className="space-y-4">
        {submittedTasks.map((task) => {
          const exec = executions.find((e) => e.taskId === task.id);
          const isAccepted = task.executionStatus === 'accepted' || task.executionStatus === 'payment_verified';
          const isPaid = task.executionStatus === 'payment_verified';

          return (
            <div
              key={task.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-2xs text-slate-400">
                    <span className="font-semibold text-slate-300">{task.providerId}</span>
                    <span>·</span>
                    <span className="font-mono">#{task.taskId}</span>
                    <span>·</span>
                    <span className={`font-semibold flex items-center gap-1 ${isAccepted ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isAccepted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{isPaid ? (lang === 'ar' ? 'تم الدفع والتحقق' : 'Paid & Verified') : isAccepted ? (lang === 'ar' ? 'تم قبول الحل' : 'Deliverable Accepted') : (lang === 'ar' ? 'بانتظار مراجعة المشرف' : 'Under Maintainer Review')}</span>
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{task.title}</h3>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                      ${task.rewardAmount.toFixed(2)}
                    </div>
                    <div className="text-2xs text-slate-500 uppercase">{task.currency}</div>
                  </div>

                  {!isAccepted ? (
                    <button
                      onClick={() => handleAcceptance(task)}
                      disabled={loadingTaskId === task.id}
                      className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition shadow-xs"
                    >
                      {loadingTaskId === task.id ? (lang === 'ar' ? 'جاري التحقق...' : 'Checking...') : (lang === 'ar' ? 'تسجيل موافقة المشرف' : 'Record Acceptance')}
                    </button>
                  ) : !isPaid ? (
                    <button
                      onClick={() => onVerifyPayment(task)}
                      className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-xs"
                    >
                      {lang === 'ar' ? 'توثيق الدفع المصرفي' : 'Verify Bank Payment'}
                    </button>
                  ) : (
                    <span className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 text-2xs font-semibold text-emerald-400">
                      {lang === 'ar' ? 'محرر في الدفتر' : 'Reconciled in Ledger'}
                    </span>
                  )}
                </div>
              </div>

              {/* Submission Payload Info */}
              {exec && (
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 text-xs space-y-2 font-mono">
                  <div className="flex items-center justify-between text-2xs text-slate-400">
                    <span>Target Reference:</span>
                    <a
                      href={exec.submissionReference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span className="truncate max-w-xs">{exec.submissionReference}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-2xs text-slate-400">
                    <span>Evidence Hash: </span>
                    <span className="text-slate-200 select-all">{exec.evidenceHash}</span>
                  </div>
                  {exec.submittedAt && (
                    <div className="text-2xs text-slate-500">
                      Dispatched at: {new Date(exec.submittedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {submittedTasks.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-500">
            {lang === 'ar'
              ? 'لم يتم إرسال أي تقديمات بعد. قم بتنفيذ مهمة وإرسالها لتظهر هنا.'
              : 'No submissions dispatched yet. Complete an execution and submit to start review tracking.'}
          </div>
        )}
      </div>
    </div>
  );
};
