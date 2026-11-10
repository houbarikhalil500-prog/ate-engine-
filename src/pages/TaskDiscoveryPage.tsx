import React, { useState } from 'react';
import { TaskRecord } from '../types';
import { Language, translations } from '../i18n/translations';
import { 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Compass, 
  RefreshCw,
  Cpu
} from 'lucide-react';

interface Props {
  tasks: TaskRecord[];
  lang: Language;
  onRefresh: () => void;
  onDiscover: (provider?: string) => void;
  onExecute: (task: TaskRecord) => void;
  onValidate: (task: TaskRecord) => void;
  isDiscovering: boolean;
}

export const TaskDiscoveryPage: React.FC<Props> = ({
  tasks,
  lang,
  onRefresh,
  onDiscover,
  onExecute,
  onValidate,
  isDiscovering,
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);

  const filtered = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      task.taskId.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = 
      providerFilter === 'all' || task.providerId.includes(providerFilter);
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>{t.nav.discovery}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'ماسح الفرص الحقيقية عبر واجهات برمجة Algora و GitHub Funded Bounties والمزودين الشركاء المعتمدين.'
              : 'Autonomous discovery stream querying Algora API, GitHub Funded Bounties, and verified direct corporate partners.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => onDiscover(providerFilter === 'all' ? undefined : providerFilter)}
            disabled={isDiscovering}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
            <span>{isDiscovering ? (lang === 'ar' ? 'جاري المسح...' : 'Scanning...') : t.actions.scanNow}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.actions.search}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2 ps-9 pe-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {['all', 'algora', 'github', 'custom'].map((prov) => (
            <button
              key={prov}
              onClick={() => setProviderFilter(prov)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                providerFilter === prov
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {prov === 'all'
                ? (lang === 'ar' ? 'جميع المزودين' : 'All Providers')
                : prov === 'algora'
                ? 'Algora'
                : prov === 'github'
                ? 'GitHub'
                : 'Partner'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table / Card List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="divide-y divide-slate-800/60">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="p-4 sm:p-5 hover:bg-slate-800/20 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap text-2xs text-slate-400">
                  <span className="font-semibold text-slate-300">{task.providerId}</span>
                  <span>·</span>
                  <span className="font-mono">{task.taskId}</span>
                  <span>·</span>
                  <span className={task.policyStatus === 'passed' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                    {task.policyStatus === 'passed' ? t.policy.passed : t.policy.rejected}
                  </span>
                  <span>·</span>
                  <span className="text-slate-400">
                    {lang === 'ar' ? 'التمويل:' : 'Escrow:'} {task.fundingStatus.toUpperCase()}
                  </span>
                  <span>·</span>
                  <span className="text-slate-400">
                    {lang === 'ar' ? 'الجزائر:' : 'Algeria:'} {task.countryEligibility.algeriaAllowed ? '✓' : '✗'}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white leading-snug">
                  {task.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>

                {task.policyRejectionReasons.length > 0 && (
                  <div className="text-2xs text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded-md p-2 mt-2">
                    <span className="font-semibold">{lang === 'ar' ? 'أسباب الرفض:' : 'Rejection Reasons:'} </span>
                    {task.policyRejectionReasons.join(' · ')}
                  </div>
                )}
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/60">
                <div className="text-left lg:text-right">
                  <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                    ${task.rewardAmount.toFixed(2)}
                  </div>
                  <div className="text-2xs text-slate-500 uppercase">{task.currency}</div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={task.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="View Source on GitHub/Provider"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onValidate(task)}
                    className="rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    {lang === 'ar' ? 'إعادة التحقق' : 'Validate'}
                  </button>

                  {task.policyStatus === 'passed' && (
                    <button
                      onClick={() => onExecute(task)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-xs"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{t.actions.executeTask}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-500">
              {lang === 'ar' ? 'لم يتم العثور على فرص تطابق معايير البحث.' : 'No opportunities found matching search criteria.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
