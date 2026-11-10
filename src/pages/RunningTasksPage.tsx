import React from 'react';
import { TaskRecord, ExecutionRecord } from '../types';
import { Language, translations } from '../i18n/translations';
import { Cpu, Loader2, CheckCircle2, ShieldCheck, Terminal, Layers } from 'lucide-react';

interface Props {
  tasks: TaskRecord[];
  executions: ExecutionRecord[];
  lang: Language;
  onNavigateTab: (tab: any) => void;
}

export const RunningTasksPage: React.FC<Props> = ({
  tasks,
  executions,
  lang,
  onNavigateTab,
}) => {
  const t = translations[lang];
  const running = tasks.filter(
    (t) => t.executionStatus === 'executing' || t.executionStatus === 'planning'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>{t.nav.running}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'مراقبة الذكاء الاصطناعي (Gemini 3.8 Flash) أثناء تحليل المتطلبات، كتابة الشيفرة البرمجية، واختبارها في بيئة الصندوق المعزولة.'
            : 'Live monitoring of autonomous Gemini 3.8 Flash execution, isolated sandbox test suites, and SHA-256 sealing.'}
        </p>
      </div>

      {running.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-500">
          <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-slate-300 font-semibold mb-1">
            {lang === 'ar' ? 'لا توجد مهام قيد التنفيذ حالياً' : 'No active executions running'}
          </div>
          <p className="text-slate-500 max-w-sm mx-auto mb-4">
            {lang === 'ar'
              ? 'انتقل إلى تبويب "المهام المؤهلة" لاختيار مهمة وبدء تنفيذها ذاتياً بواسطة الذكاء الاصطناعي.'
              : 'Head over to Eligible Tasks to trigger autonomous execution on approved opportunities.'}
          </p>
          <button
            onClick={() => onNavigateTab('eligible')}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
          >
            {lang === 'ar' ? 'استعراض المهام المؤهلة' : 'Browse Eligible Tasks'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {running.map((task) => {
            const exec = executions.find((e) => e.taskId === task.id);
            return (
              <div
                key={task.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'ar' ? 'قيد التنفيذ الذاتي...' : 'Autonomous Execution in Progress...'}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">
                    ${task.rewardAmount.toFixed(2)} {task.currency}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{task.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                </div>

                {/* Plan Steps Pipeline */}
                {exec && (
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <div className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                      {lang === 'ar' ? 'مراحل خطة التنفيذ المعتمدة' : 'Execution Plan Stages'}
                    </div>
                    <div className="space-y-1.5">
                      {exec.planSteps.map((step) => (
                        <div
                          key={step.stepNumber}
                          className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : step.status === 'in_progress' ? (
                              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                            ) : (
                              <span className="h-3.5 w-3.5 rounded-full border border-slate-700" />
                            )}
                            <span className="text-slate-200">
                              {step.stepNumber}. {step.title}
                            </span>
                          </div>
                          <span className="text-2xs text-slate-500">
                            {step.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
