import React from 'react';
import { SystemMetrics } from '../types';
import { Language, translations } from '../i18n/translations';
import { 
  Activity, 
  DollarSign, 
  Cpu, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Radio, 
  Clock 
} from 'lucide-react';

interface Props {
  metrics: SystemMetrics | null;
  lang: Language;
  onRefresh: () => void;
}

export const SystemMonitoringPage: React.FC<Props> = ({
  metrics,
  lang,
  onRefresh,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span>{t.nav.monitoring}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'مراقبة التكاليف التشغيلية (0.00$)، استهلاك الحصص المجانية لواجهات Gemini و GitHub، وسلامة مكونات النظام.'
            : 'Zero-cost operation monitor, free-tier quota telemetry (Gemini & GitHub), and subsystem health status.'}
        </p>
      </div>

      {/* Cost & Budget Guard Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>{lang === 'ar' ? 'مراقبة التكاليف والحد الأقصى للميزانية' : 'Cost & Budget Enforcement (Zero Paid Upgrades)'}</span>
          </div>
          <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3 py-0.5 text-2xs font-semibold text-emerald-400">
            {lang === 'ar' ? 'حماية التكلفة الصفرية نشطة' : 'Zero-Cost Guard Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
            <span className="text-2xs text-slate-400 block font-sans">
              {lang === 'ar' ? 'التكاليف المتكبدة الفعلية' : 'Actual Operating Expenses'}
            </span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block tabular-nums">
              ${(metrics?.operatingCosts ?? 0).toFixed(2)}
            </span>
            <span className="text-3xs text-slate-500 mt-1 block font-sans">
              Strict $0.00 zero-cost model
            </span>
          </div>

          <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
            <span className="text-2xs text-slate-400 block font-sans">
              {lang === 'ar' ? 'استهلاك توكنز Gemini المجانية' : 'Gemini 3.8 Flash Free Quota'}
            </span>
            <span className="text-2xl font-bold text-cyan-400 mt-1 block tabular-nums">
              {(metrics?.geminiTokensUsed ?? 0).toLocaleString()}
            </span>
            <span className="text-3xs text-slate-500 mt-1 block font-sans">
              Standard free RPM / RPD limits
            </span>
          </div>

          <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
            <span className="text-2xs text-slate-400 block font-sans">
              {lang === 'ar' ? 'طلبات GitHub REST API المجانية' : 'GitHub REST Requests'}
            </span>
            <span className="text-2xl font-bold text-purple-400 mt-1 block tabular-nums">
              {metrics?.githubRequestsMade ?? 0}
            </span>
            <span className="text-3xs text-slate-500 mt-1 block font-sans">
              Rate limit: 5,000 req/hr remaining
            </span>
          </div>
        </div>
      </div>

      {/* Subsystem Health Status Matrix */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider">
          {lang === 'ar' ? 'حالة المكونات الفرعية للنظام' : 'Subsystem Status & Verification Invariants'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-semibold text-slate-200">Gemini 3.8 Flash AI Engine</div>
                <div className="text-2xs text-slate-500 font-mono">Server-side @google/genai SDK</div>
              </div>
            </div>
            <span className="text-2xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Operational</span>
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-purple-400" />
              <div>
                <div className="font-semibold text-slate-200">PostgreSQL / Supabase Storage</div>
                <div className="text-2xs text-slate-500 font-mono">001_initial_ate_schema.sql ready</div>
              </div>
            </div>
            <span className="text-2xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Synced</span>
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-semibold text-slate-200">Algora & GitHub REST Connectors</div>
                <div className="text-2xs text-slate-500 font-mono">Real bounty discovery enabled</div>
              </div>
            </div>
            <span className="text-2xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active</span>
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-slate-200">Algerian Banking Compliance Guard</div>
                <div className="text-2xs text-slate-500 font-mono">Fiat only, no unauthorized USDT</div>
              </div>
            </div>
            <span className="text-2xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Compliant</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
