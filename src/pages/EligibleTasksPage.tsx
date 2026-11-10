import React, { useState } from 'react';
import { TaskRecord } from '../types';
import { Language, translations } from '../i18n/translations';
import { 
  CheckCircle2, 
  Cpu, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Zap, 
  ArrowUpDown 
} from 'lucide-react';

interface Props {
  tasks: TaskRecord[];
  lang: Language;
  onExecute: (task: TaskRecord) => void;
  isExecutingId?: string | null;
}

export const EligibleTasksPage: React.FC<Props> = ({
  tasks,
  lang,
  onExecute,
  isExecutingId,
}) => {
  const t = translations[lang];
  const [sortBy, setSortBy] = useState<'reward' | 'difficulty'>('reward');

  const eligibleTasks = tasks.filter((t) => t.policyStatus === 'passed');

  const sorted = [...eligibleTasks].sort((a, b) => {
    if (sortBy === 'reward') {
      return b.rewardAmount - a.rewardAmount;
    }
    return a.difficultyScore - b.difficultyScore;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{t.nav.eligible}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'المهام التي اجتازت جميع قواعد سياسة الأتمتة: تمويل مضمون، تصريح بالبوتات، خلو من الرسوم المسبقة، وأهلية الجزائر.'
              : 'Tasks meeting 100% of automation criteria: Escrow funded, bot-permitted, zero operator upfront fee, and Algeria compliance.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xs text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            <span>{lang === 'ar' ? 'الترتيب حسب:' : 'Sort by:'}</span>
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setSortBy('reward')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                sortBy === 'reward' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ar' ? 'أعلى مكافأة' : 'Highest Reward'}
            </button>
            <button
              onClick={() => setSortBy('difficulty')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                sortBy === 'difficulty' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'ar' ? 'الأسهل تنفيذاً' : 'Lowest Complexity'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Eligible Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((task) => {
          const executing = isExecutingId === task.id;
          return (
            <div
              key={task.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-2xs text-slate-400">
                  <span className="font-semibold text-cyan-400 uppercase tracking-wider">{task.providerId}</span>
                  <span className="font-mono text-emerald-400 font-bold text-base tabular-nums">
                    ${task.rewardAmount.toFixed(2)} {task.currency}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {task.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {task.description}
                </p>

                {/* Policy Checks Checklist */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-2xs text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{lang === 'ar' ? 'البوتات والذكاء الاصطناعي مسموح بها صراحة' : 'Explicit AI/Bot automation permitted'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-2xs text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{lang === 'ar' ? 'تمويل موثق في حساب الضمان (Escrow Funded)' : 'Verifiable escrow funding confirmed'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-2xs text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{lang === 'ar' ? 'صفر رسوم مسبقة أو إيداعات غاز' : 'Zero upfront deposit / gas required'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-2xs text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{lang === 'ar' ? 'أهلية الجزائر والدفعات الدولية مؤكدة' : 'Algeria jurisdiction & SWIFT wire eligible'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Metadata and Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-2xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{lang === 'ar' ? 'الصعوبة:' : 'Diff:'} {task.difficultyScore}/5</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>~{task.estimatedMinutes}m</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={task.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Source Repository / Issue"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onExecute(task)}
                    disabled={executing}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-xs"
                  >
                    <Cpu className={`w-3.5 h-3.5 ${executing ? 'animate-spin' : ''}`} />
                    <span>{executing ? (lang === 'ar' ? 'جاري التنفيذ...' : 'Executing...') : t.actions.executeTask}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="col-span-full rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-500">
            {lang === 'ar'
              ? 'لا توجد مهام مؤهلة حالياً. قم بتشغيل الاستكشاف لفحص الفرص الجديدة.'
              : 'No eligible tasks currently pending execution. Scan discovery providers to evaluate new opportunities.'}
          </div>
        )}
      </div>
    </div>
  );
};
