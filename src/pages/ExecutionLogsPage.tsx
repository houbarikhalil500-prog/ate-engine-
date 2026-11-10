import React, { useState } from 'react';
import { SystemLog } from '../types';
import { Language, translations } from '../i18n/translations';
import { Terminal, RefreshCw, ShieldAlert, AlertCircle, Info, ShieldCheck } from 'lucide-react';

interface Props {
  logs: SystemLog[];
  lang: Language;
  onRefresh: () => void;
}

export const ExecutionLogsPage: React.FC<Props> = ({
  logs,
  lang,
  onRefresh,
}) => {
  const t = translations[lang];
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = logs.filter((log) => {
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesLevel && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>{t.nav.logs}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'سجل التدقيق الشامل لعمليات الاستكشاف، تقييم السياسات، استدعاءات الذكاء الاصطناعي، والتحقق المالي.'
              : 'Immutable operational audit trail logging discovery, policy decisions, AI reasoning, and settlements.'}
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {['all', 'info', 'warn', 'error', 'security'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1 rounded-md text-2xs uppercase tracking-wider font-semibold transition ${
                levelFilter === lvl
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {['all', 'discovery', 'policy', 'execution', 'payment', 'n8n', 'compliance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-2xs uppercase tracking-wider font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Log Console Viewer */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 font-mono text-2xs text-slate-300 overflow-hidden shadow-inner">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-slate-400 text-3xs">
          <span>CONSOLE LOG STREAM</span>
          <span>{filtered.length} entries shown</span>
        </div>

        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto divide-y divide-slate-900">
          {filtered.map((log) => {
            const levelColor =
              log.level === 'error'
                ? 'text-rose-400'
                : log.level === 'warn'
                ? 'text-amber-400'
                : log.level === 'security'
                ? 'text-purple-400'
                : 'text-cyan-400';

            return (
              <div key={log.id} className="pt-2 first:pt-0 flex items-start gap-2.5 leading-relaxed">
                <span className="text-slate-500 tabular-nums shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
                <span className={`font-bold shrink-0 uppercase ${levelColor}`}>
                  [{log.level}]
                </span>
                <span className="text-slate-400 shrink-0 font-semibold">
                  [{log.category.toUpperCase()}]
                </span>
                <span className="text-slate-200 select-all flex-1">
                  {log.message}
                </span>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              No log events match selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
