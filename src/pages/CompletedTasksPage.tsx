import React, { useState } from 'react';
import { TaskRecord, ExecutionRecord } from '../types';
import { Language, translations } from '../i18n/translations';
import { 
  Layers, 
  Send, 
  CheckCircle2, 
  FileCode, 
  Hash, 
  Clock, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

interface Props {
  tasks: TaskRecord[];
  executions: ExecutionRecord[];
  lang: Language;
  onSubmit: (task: TaskRecord) => void;
  isSubmittingId?: string | null;
}

export const CompletedTasksPage: React.FC<Props> = ({
  tasks,
  executions,
  lang,
  onSubmit,
  isSubmittingId,
}) => {
  const t = translations[lang];
  const [activeFileTaskId, setActiveFileTaskId] = useState<string | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const completed = tasks.filter(
    (t) => 
      t.executionStatus === 'completed' || 
      t.executionStatus === 'submitted' || 
      t.executionStatus === 'accepted' || 
      t.executionStatus === 'payment_verified'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span>{t.nav.completed}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'المهام التي تم توليد برمجياتها واجتياز اختبارات الصندوق المعزول، مع توثيق أدلة التجزئة المشفرة SHA-256.'
            : 'Tasks with fully synthesized code deliverables, verified hermetic sandbox tests, and SHA-256 evidence bundles.'}
        </p>
      </div>

      <div className="space-y-4">
        {completed.map((task) => {
          const exec = executions.find((e) => e.taskId === task.id);
          const isExpanded = activeFileTaskId === task.id;
          const isSubmitted = task.executionStatus !== 'completed';

          return (
            <div
              key={task.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-2xs text-slate-400 flex-wrap">
                    <span className="font-semibold text-cyan-400">{task.providerId}</span>
                    <span>·</span>
                    <span className="font-mono">#{task.taskId}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.status[task.executionStatus]}</span>
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

                  {!isSubmitted ? (
                    <button
                      onClick={() => onSubmit(task)}
                      disabled={isSubmittingId === task.id}
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingId === task.id ? (lang === 'ar' ? 'جاري التسليم...' : 'Submitting...') : t.actions.submitWork}</span>
                    </button>
                  ) : (
                    <span className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 text-2xs font-semibold text-emerald-400">
                      {lang === 'ar' ? 'تم التسليم بنجاح' : 'Delivered & Dispatched'}
                    </span>
                  )}
                </div>
              </div>

              {/* Deliverable Evidence Details */}
              {exec && (
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs">
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                      <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>SHA-256: </span>
                      <span className="text-slate-200 select-all">{exec.evidenceHash}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono tabular-nums">{exec.executionTimeMs}ms execution time</span>
                    </div>
                  </div>

                  {/* Quality Checklist Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-2xs">
                    {exec.qualityChecks.map((qc, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{qc.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Deliverables toggle & viewer */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setActiveFileTaskId(isExpanded ? null : task.id);
                        setSelectedFileIndex(0);
                      }}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>
                        {isExpanded
                          ? (lang === 'ar' ? 'إخفاء ملفات الشيفرة' : 'Hide Deliverable Files')
                          : (lang === 'ar' ? `معاينة الملفات المنفذة (${exec.deliverables.length})` : `Inspect Synthesized Deliverables (${exec.deliverables.length} files)`)}
                      </span>
                    </button>

                    {exec.submissionReference && (
                      <a
                        href={exec.submissionReference}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <span>{lang === 'ar' ? 'عرض طلب السحب (PR)' : 'View GitHub PR'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Interactive Code Viewer */}
                  {isExpanded && exec.deliverables.length > 0 && (
                    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                      <div className="flex items-center gap-1 bg-slate-900 border-b border-slate-800 px-3 py-1.5">
                        {exec.deliverables.map((file, idx) => (
                          <button
                            key={file.filename}
                            onClick={() => setSelectedFileIndex(idx)}
                            className={`px-2.5 py-1 text-2xs font-mono rounded transition ${
                              selectedFileIndex === idx
                                ? 'bg-slate-800 text-cyan-400 font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {file.filename}
                          </button>
                        ))}
                      </div>

                      <pre className="p-4 text-2xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-64">
                        <code>{exec.deliverables[selectedFileIndex]?.content}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {completed.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-500">
            {lang === 'ar'
              ? 'لا توجد مهام مكتملة بعد. نفذ مهمة مؤهلة لإنشاء التسليمات المشفرة.'
              : 'No completed tasks yet. Execute an eligible task to generate and inspect deliverables.'}
          </div>
        )}
      </div>
    </div>
  );
};
