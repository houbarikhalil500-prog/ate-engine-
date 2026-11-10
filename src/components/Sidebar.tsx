import React from 'react';
import { TabType, SystemMetrics } from '../types';
import { Language, translations } from '../i18n/translations';
import {
  LayoutDashboard,
  Compass,
  CheckCircle2,
  Cpu,
  Layers,
  Send,
  Receipt,
  BookOpenCheck,
  GitFork,
  Radio,
  Sliders,
  Terminal,
  Activity,
  UserCheck,
} from 'lucide-react';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  lang: Language;
  metrics?: SystemMetrics | null;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  lang,
  metrics,
}) => {
  const t = translations[lang];

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'discovery', label: t.nav.discovery, icon: Compass, count: metrics?.totalDiscovered },
    { id: 'eligible', label: t.nav.eligible, icon: CheckCircle2, count: metrics?.eligibleOpportunities },
    { id: 'running', label: t.nav.running, icon: Cpu },
    { id: 'completed', label: t.nav.completed, icon: Layers, count: metrics?.successfulExecutions },
    { id: 'submissions', label: t.nav.submissions, icon: Send },
    { id: 'payments', label: t.nav.payments, icon: Receipt, count: metrics?.acceptedSubmissions },
    { id: 'ledger', label: t.nav.ledger, icon: BookOpenCheck },
    { id: 'workflows', label: t.nav.workflows, icon: GitFork, count: 7 },
    { id: 'providers', label: t.nav.providers, icon: Radio, count: 3 },
    { id: 'api_config', label: t.nav.apiConfig, icon: Sliders },
    { id: 'logs', label: t.nav.logs, icon: Terminal },
    { id: 'monitoring', label: t.nav.monitoring, icon: Activity },
    { id: 'account', label: t.nav.account, icon: UserCheck },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/80 p-3.5 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-2xs font-semibold uppercase tracking-wider text-slate-500">
          {lang === 'ar' ? 'منصة ATE المستقلة' : 'ATE Platform'}
        </div>

        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-slate-900 text-cyan-400 font-semibold border border-slate-800 shadow-xs'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-2xs tabular-nums text-slate-500 font-mono">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Free Tier Cost Monitor Footer Widget */}
      <div className="mt-4 rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 text-2xs text-slate-400">
        <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
          <span>{lang === 'ar' ? 'ميزانية التشغيل' : 'Operating Cost'}</span>
          <span className="font-mono tabular-nums text-emerald-400">$0.00</span>
        </div>
        <div className="text-slate-500 leading-tight">
          {lang === 'ar' 
            ? 'حماية السقف المجاني مفعلة (الحد الأقصى 0.00$)' 
            : 'Zero-cost free tier guard active (Zero paid upgrades)'}
        </div>
      </div>
    </aside>
  );
};
