import React, { useState } from 'react';
import { ProviderConnection } from '../types';
import { Language, translations } from '../i18n/translations';
import { Radio, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Zap } from 'lucide-react';

interface Props {
  providers: ProviderConnection[];
  lang: Language;
  onTestProvider: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const ProvidersPage: React.FC<Props> = ({
  providers,
  lang,
  onTestProvider,
  onRefresh,
}) => {
  const t = translations[lang];
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTest = async (id: string) => {
    setTestingId(id);
    await onTestProvider(id);
    setTestingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>{t.nav.providers}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar'
              ? 'روابط المزودين المعتمدين للمهام الممولة (Algora API, GitHub REST API, وشركاء التحويل المصرفي المباشر).'
              : 'Active connectors for verified paid task providers with rate limit tracking and health probes.'}
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

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-2xs">
                <span className="font-semibold text-cyan-400 uppercase tracking-wider">{p.type}</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{p.status.toUpperCase()}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{p.name}</h3>
              <p className="text-2xs font-mono text-slate-400 truncate">{p.baseUrl}</p>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-2xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{lang === 'ar' ? 'المهام المؤكدة:' : 'Verified Tasks:'}</span>
                  <span className="font-mono text-slate-200 font-semibold">{p.verifiedOpportunitiesCount}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{lang === 'ar' ? 'حدود الطلبات المتبقية:' : 'Rate Limit Remaining:'}</span>
                  <span className="font-mono text-cyan-400 font-semibold">{p.rateLimitRemaining} req</span>
                </div>
                {p.lastSyncAt && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>{lang === 'ar' ? 'آخر مزامنة:' : 'Last Synced:'}</span>
                    <span className="font-mono">{new Date(p.lastSyncAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <a
                href={p.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <span>Endpoint</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleTest(p.id)}
                disabled={testingId === p.id}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 disabled:opacity-50 transition"
              >
                <Zap className={`w-3.5 h-3.5 ${testingId === p.id ? 'animate-spin' : ''}`} />
                <span>{testingId === p.id ? (lang === 'ar' ? 'جاري الاختبار...' : 'Testing...') : t.actions.testConnection}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
