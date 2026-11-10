import React from 'react';
import { SystemMetrics, LedgerSummary, TaskRecord } from '../types';
import { Language, translations } from '../i18n/translations';
import { 
  Compass, 
  CheckCircle2, 
  Cpu, 
  Receipt, 
  Wallet, 
  ShieldCheck, 
  ArrowUpRight, 
  TrendingUp,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface Props {
  metrics: SystemMetrics | null;
  ledgerSummary: LedgerSummary | null;
  recentTasks: TaskRecord[];
  lang: Language;
  onRefresh: () => void;
  onNavigateTab: (tab: any) => void;
  onRunAcceptanceTest: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  metrics,
  ledgerSummary,
  recentTasks,
  lang,
  onRefresh,
  onNavigateTab,
  onRunAcceptanceTest,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      {/* Top Banner Notice: Zero-Upfront Free Tier & Truthful Financial Integrity */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حماية النزاهة المالية وخلو التكاليف' : 'Zero-Cost Free-Tier Operation & Truthful Ledger'}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
            {lang === 'ar' ? 'محرك كسب المهام الذاتي المستقل (ATE)' : 'ATE – Autonomous Task Earning Engine'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {lang === 'ar'
              ? 'نظام مستقل يبحث عن الأعمال الرقمية الحقيقية الممولة بحساب ضمان، يتحقق من تصاريح الذكاء الاصطناعي، يحل المهام وينتج التسليمات البرمجية، ويوثق الأموال في دفتر أستاذ حقيقي دون أرباح وهمية.'
              : 'Autonomous engine that discovers genuine escrow-funded digital work, validates AI permissions, executes verified solutions, and records actual bank-cleared earnings with zero fake deposits.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.actions.refresh}</span>
          </button>
          <button
            onClick={onRunAcceptanceTest}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.runAcceptanceTest}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-2xs font-medium text-slate-400 flex items-center justify-between">
            <span>{t.metrics.discovered}</span>
            <Compass className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {metrics?.totalDiscovered ?? 0}
          </div>
          <div className="mt-1 text-2xs text-slate-500 flex items-center gap-1">
            <span className="text-cyan-400 font-semibold">{metrics?.eligibleOpportunities ?? 0}</span>
            <span>{lang === 'ar' ? 'مؤهل وفق السياسة' : 'policy eligible'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-2xs font-medium text-slate-400 flex items-center justify-between">
            <span>{t.metrics.executions}</span>
            <Cpu className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {metrics?.successfulExecutions ?? 0}
          </div>
          <div className="mt-1 text-2xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{metrics?.acceptedSubmissions ?? 0}</span>
            <span>{lang === 'ar' ? 'تم القبول من المزود' : 'accepted by maintainer'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-2xs font-medium text-slate-400 flex items-center justify-between">
            <span>{t.metrics.received}</span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ${(ledgerSummary?.paymentsReceivedUsd ?? 0).toFixed(2)}
          </div>
          <div className="mt-1 text-2xs text-slate-500">
            {lang === 'ar' ? 'موثق عبر تسوية مصرفية' : 'Independently verified settlement'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-2xs font-medium text-slate-400 flex items-center justify-between">
            <span>{t.metrics.withdrawable}</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-300 tabular-nums">
            ${(ledgerSummary?.withdrawableBalanceUsd ?? 0).toFixed(2)}
          </div>
          <div className="mt-1 text-2xs text-slate-500">
            {lang === 'ar' ? 'متاح للتحويل المصرفي المباشر' : 'Available for bank wire release'}
          </div>
        </div>
      </div>

      {/* Financial Ledger Integrity Strip */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>{lang === 'ar' ? 'فصل أرصدة دفتر الأستاذ الخماسي' : '5-Tier Financial Ledger Breakdown'}</span>
          </h2>
          <button
            onClick={() => onNavigateTab('ledger')}
            className="text-2xs font-medium text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>{lang === 'ar' ? 'فتح الدفتر الكامل' : 'Open Full Ledger'}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 font-mono text-xs tabular-nums">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-2xs text-slate-400 block font-sans">{t.ledger.advertisedRewards}</span>
            <span className="text-base font-bold text-slate-200 mt-1 block">
              ${(ledgerSummary?.advertisedRewardsUsd ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-2xs text-slate-400 block font-sans">{t.ledger.pendingRewards}</span>
            <span className="text-base font-bold text-amber-400 mt-1 block">
              ${(ledgerSummary?.pendingRewardsUsd ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-2xs text-slate-400 block font-sans">{t.ledger.acceptedRewards}</span>
            <span className="text-base font-bold text-cyan-400 mt-1 block">
              ${(ledgerSummary?.acceptedRewardsUsd ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-2xs text-slate-400 block font-sans">{t.ledger.paymentsReceived}</span>
            <span className="text-base font-bold text-emerald-400 mt-1 block">
              ${(ledgerSummary?.paymentsReceivedUsd ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-2xs text-slate-400 block font-sans">{t.metrics.netEarnings}</span>
            <span className="text-base font-bold text-emerald-300 mt-1 block">
              ${(ledgerSummary?.netVerifiedEarningsUsd ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Discovered Opportunities Pipeline */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            {lang === 'ar' ? 'أحدث الفرص في مسار المحرك' : 'Recent Opportunities in Engine Pipeline'}
          </h2>
          <button
            onClick={() => onNavigateTab('discovery')}
            className="text-2xs font-medium text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>{lang === 'ar' ? 'عرض جميع المهام' : 'View All Tasks'}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {recentTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/20 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap text-2xs text-slate-400 mb-1">
                  <span className="text-slate-300 font-semibold">{task.providerId}</span>
                  <span>·</span>
                  <span className="font-mono">#{task.taskId}</span>
                  <span>·</span>
                  <span className={task.policyStatus === 'passed' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                    {task.policyStatus === 'passed' ? t.policy.passed : t.policy.rejected}
                  </span>
                  <span>·</span>
                  <span>{task.fundingStatus.toUpperCase()}</span>
                </div>
                <h3 className="text-sm font-semibold text-white truncate">{task.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                    ${task.rewardAmount.toFixed(2)}
                  </div>
                  <div className="text-2xs text-slate-500 uppercase">{task.currency}</div>
                </div>

                <button
                  onClick={() => onNavigateTab(task.policyStatus === 'passed' ? 'eligible' : 'discovery')}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 transition"
                >
                  {t.actions.viewDetails}
                </button>
              </div>
            </div>
          ))}

          {recentTasks.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              {lang === 'ar' ? 'لا توجد مهام حالياً. اضغط على استكشاف الآن لبدء الفحص.' : 'No tasks discovered yet. Click Discover Now to initiate scan.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
