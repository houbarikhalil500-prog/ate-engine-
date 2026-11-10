import React, { useState } from 'react';
import { LedgerEntry, LedgerSummary } from '../types';
import { Language, translations } from '../i18n/translations';
import { 
  BookOpenCheck, 
  ShieldCheck, 
  Lock, 
  Scale, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Filter 
} from 'lucide-react';

interface Props {
  ledgerEntries: LedgerEntry[];
  summary: LedgerSummary | null;
  lang: Language;
}

export const FinancialLedgerPage: React.FC<Props> = ({
  ledgerEntries,
  summary,
  lang,
}) => {
  const t = translations[lang];
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = ledgerEntries.filter((item) => {
    if (filterType === 'all') return true;
    return item.entryType === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5 text-cyan-400" />
          <span>{t.nav.ledger}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'دفتر أستاذ مالي حقيقي يفصل بين المكافآت المعلنة والمعلقة والمقبولة والمدفوعات المحصلة والرصيد القابل للسحب، مع حظر الأرباح الوهمية.'
            : 'Strict multi-tier financial ledger strictly partitioning Advertised, Pending, Accepted, Received, and Withdrawable balances.'}
        </p>
      </div>

      {/* 5-Tier Summary Balances */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-2xs font-medium text-slate-400 uppercase tracking-wider">
            {t.ledger.advertisedRewards}
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-200 tabular-nums">
            ${(summary?.advertisedRewardsUsd ?? 0).toFixed(2)}
          </div>
          <div className="mt-1 text-3xs text-slate-500">
            {lang === 'ar' ? 'معلن في المنصات الشريكة' : 'Discovered in escrow catalog'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-2xs font-medium text-amber-400 uppercase tracking-wider">
            {t.ledger.pendingRewards}
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-400 tabular-nums">
            ${(summary?.pendingRewardsUsd ?? 0).toFixed(2)}
          </div>
          <div className="mt-1 text-3xs text-slate-500">
            {lang === 'ar' ? 'تم تسليم العمل وبانتظار المراجعة' : 'Delivered & awaiting maintainer'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-2xs font-medium text-cyan-400 uppercase tracking-wider">
            {t.ledger.acceptedRewards}
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-cyan-400 tabular-nums">
            ${(summary?.acceptedRewardsUsd ?? 0).toFixed(2)}
          </div>
          <div className="mt-1 text-3xs text-slate-500">
            {lang === 'ar' ? 'تمت الموافقة من المشرف' : 'Merged & scheduled for payout'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-2xs font-medium text-emerald-400 uppercase tracking-wider">
            {t.ledger.paymentsReceived}
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400 tabular-nums">
            ${(summary?.paymentsReceivedUsd ?? 0).toFixed(2)}
          </div>
          <div className="mt-1 text-3xs text-slate-500">
            {lang === 'ar' ? 'مسوى مصرفياً ومؤكد' : 'Bank wire independently cleared'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-2xs font-medium text-white uppercase tracking-wider flex items-center justify-between">
            <span>{t.ledger.withdrawableBalance}</span>
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-cyan-300 tabular-nums">
            ${(summary?.withdrawableBalanceUsd ?? 0).toFixed(2)}
          </div>
          <div className="mt-1 text-3xs text-slate-500">
            {lang === 'ar' ? 'الرصيد الابتدائي 0.00$ بالضبط' : 'Initial balance strictly $0.00'}
          </div>
        </div>
      </div>

      {/* Zero Fabrication & Legal Algeria Compliance Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{lang === 'ar' ? 'مبادئ الشفافية والامتثال القانوني الحازم' : 'Strict Double-Entry Principles & Algeria Legal Compliance'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-2xs text-slate-400 leading-relaxed pt-1">
          <div>
            <span className="font-semibold text-slate-300">{lang === 'ar' ? 'حظر الأرباح الوهمية:' : 'Zero-Fabrication Guarantee:'} </span>
            {t.ledger.noFabricationNotice}
          </div>
          <div>
            <span className="font-semibold text-slate-300">{lang === 'ar' ? 'قوانين الجمهورية الجزائرية:' : 'Algerian Banking Mandate:'} </span>
            {t.ledger.algeriaComplianceNote}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: lang === 'ar' ? 'جميع القيود' : 'All Entries' },
          { id: 'payment_received', label: t.ledger.paymentsReceived },
          { id: 'withdrawable_balance', label: t.ledger.withdrawableBalance },
          { id: 'accepted_reward', label: t.ledger.acceptedRewards },
          { id: 'pending_reward', label: t.ledger.pendingRewards },
          { id: 'advertised_reward', label: t.ledger.advertisedRewards },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === f.id
                ? 'bg-slate-800 text-cyan-400 border-slate-700 font-semibold'
                : 'border-slate-800/80 bg-slate-900/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ledger Entries Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-2xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.ledger.date}</th>
                <th className="py-3 px-4">{t.ledger.entryType}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'المهمة والبيان' : 'Task & Notes'}</th>
                <th className="py-3 px-4">{t.ledger.counterparty}</th>
                <th className="py-3 px-4">{t.ledger.evidence}</th>
                <th className="py-3 px-4 text-right">{t.ledger.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((item) => {
                const isPositive = item.entryType === 'payment_received' || item.entryType === 'withdrawable_balance';
                return (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-2xs tabular-nums">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-2xs">
                      <span className="rounded-sm px-2 py-0.5 border border-slate-700 bg-slate-800 text-slate-300 font-sans font-semibold">
                        {item.entryType.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans">
                      <div className="font-semibold">{item.taskTitle || 'Engine Central Allocation'}</div>
                      <div className="text-2xs text-slate-400">{item.notes}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-2xs font-mono">
                      {item.counterparty}
                    </td>
                    <td className="py-3 px-4 text-cyan-400 text-2xs select-all">
                      {item.verificationEvidence || '—'}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums text-sm ${
                      isPositive ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {isPositive ? '+' : ''}${item.amount.toFixed(2)} {item.currency}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans text-xs">
                    {lang === 'ar' ? 'لا توجد قيود مسجلة لهذا النوع.' : 'No ledger entries recorded for this category.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
