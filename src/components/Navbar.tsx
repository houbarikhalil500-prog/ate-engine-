import React from 'react';
import { TabType } from '../types';
import { Language, translations } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';
import { Play, Globe, ShieldCheck } from 'lucide-react';

interface Props {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  lang: Language;
  onToggleLang: () => void;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
  onOpenAcceptanceTest: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  isLiveMode,
  onToggleLiveMode,
  onOpenAcceptanceTest,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-8 border-b border-slate-800 bg-slate-950/95 px-6 backdrop-blur-md">
      {/* Zone 1: Single element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden"
        >
          <img src="/icon.svg" alt="ATE" className="h-7 w-7 rounded-md" />
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            ATE Engine
          </span>
        </button>

        {/* Live vs Audit Mode badge toggle */}
        <button
          onClick={onToggleLiveMode}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-semibold transition-colors border ${
            isLiveMode
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-700 bg-slate-800 text-slate-300'
          }`}
          title="Toggle Live Production / Test Mode"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
          <span>{isLiveMode ? t.liveMode : t.testMode}</span>
        </button>
      </div>

      {/* Zone 2: 4-5 concise single-line text links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('discovery')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'discovery' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          {t.nav.discovery}
        </button>
        <button
          onClick={() => onSelectTab('eligible')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'eligible' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          {t.nav.eligible}
        </button>
        <button
          onClick={() => onSelectTab('ledger')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'ledger' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          {t.nav.ledger}
        </button>
        <button
          onClick={() => onSelectTab('workflows')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'workflows' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          {t.nav.workflows}
        </button>
        <button
          onClick={() => onSelectTab('monitoring')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'monitoring' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          {t.nav.monitoring}
        </button>
      </nav>

      {/* Zone 3: Primary action + Utilities */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Language switch button */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
          title="Switch Language / تبديل اللغة"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton lang={lang} />

        {/* Primary Action Button: Final Acceptance Test Runner */}
        <button
          onClick={onOpenAcceptanceTest}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t.runAcceptanceTest}</span>
        </button>
      </div>
    </header>
  );
};
