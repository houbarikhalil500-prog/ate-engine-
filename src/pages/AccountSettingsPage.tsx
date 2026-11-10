import React from 'react';
import { Language, translations } from '../i18n/translations';
import { UserCheck, ShieldCheck, Download, Globe, Building2 } from 'lucide-react';
import { LedgerEntry } from '../types';

interface Props {
  ledgerEntries: LedgerEntry[];
  lang: Language;
}

export const AccountSettingsPage: React.FC<Props> = ({
  ledgerEntries,
  lang,
}) => {
  const t = translations[lang];

  const exportLedgerCsv = () => {
    const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Counterparty', 'Evidence', 'Notes'];
    const rows = ledgerEntries.map((e) => [
      e.id,
      e.createdAt,
      e.entryType,
      e.amount,
      e.currency,
      `"${e.counterparty}"`,
      `"${e.verificationEvidence || ''}"`,
      `"${e.notes.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ate_financial_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          <span>{t.nav.account}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'الملف التعريفي للمشغل، بيانات الاختصاص القضائي، تصدير سجلات التدقيق المالي، والشهادات القانونية.'
            : 'Operator profile, legal jurisdiction parameters, audit trail export, and compliance certifications.'}
        </p>
      </div>

      {/* Operator Jurisdiction & Legal Entity Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'ar' ? 'الاختصاص القضائي والقوانين المالية' : 'Jurisdiction & Statutory Compliance'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-2xs text-slate-500 block font-sans">{lang === 'ar' ? 'البلد المشغّل' : 'Operator Country'}</span>
            <span className="text-slate-200 font-bold mt-1 block">Algeria (DZ) / الجمهورية الجزائرية</span>
            <span className="text-3xs text-emerald-400 font-sans mt-1 block">Fully cleared for international digital engineering export</span>
          </div>

          <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800">
            <span className="text-2xs text-slate-500 block font-sans">{lang === 'ar' ? 'القنوات المصرفية المصرح بها' : 'Authorized Payout Rails'}</span>
            <span className="text-slate-200 font-bold mt-1 block">SWIFT / SEPA / Stripe Connect</span>
            <span className="text-3xs text-slate-400 font-sans mt-1 block">Direct bank account credit in compliant foreign currency / DZD</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-2xs text-slate-400 leading-relaxed">
          <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'ar' ? 'تعهد النزاهة المالية وعدم التحايل' : 'Financial Integrity & Non-Circumvention Mandate'}</span>
          </div>
          <p>
            {lang === 'ar'
              ? 'تلتزم منصة ATE التزاماً تاماً بالقوانين المصرفية والجبائية السارية في الجزائر. يتم حظر التحويلات المبنية على أصول افتراضية غير مرخصة أو العملات المستقرة (USDT) ما لم يصدر ترخيص قانوني بذلك من بنك الجزائر. لا يتم استخدام أي طرق التفافية.'
              : 'ATE Engine strictly adheres to Algerian foreign exchange and digital commerce laws. Payouts via unauthorized virtual assets or USDT are permanently disabled without explicit authorization from the Bank of Algeria. Zero circumvention mechanisms.'}
          </p>
        </div>
      </div>

      {/* Audit Export Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'ar' ? 'تصدير سجلات التدقيق المالي' : 'Financial Audit & Tax Ledger Export'}</span>
        </div>

        <p className="text-2xs text-slate-400 leading-relaxed">
          {lang === 'ar'
            ? 'يمكنك تصدير دفتر الأستاذ كاملاً بجميع القيود والأدلة الموثقة بصيغة CSV للمراجعة المحاسبية والامتثال الضريبي.'
            : 'Download the full reconciled ledger with all transaction evidence, timestamps, and counterparties for accounting audit and tax reporting.'}
        </p>

        <button
          onClick={exportLedgerCsv}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تصدير دفتر الأستاذ المالي (CSV)' : 'Export Full Financial Ledger (CSV)'}</span>
        </button>
      </div>
    </div>
  );
};
