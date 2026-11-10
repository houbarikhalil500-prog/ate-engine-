import React, { useState } from 'react';
import { Language, translations } from '../i18n/translations';
import { Sliders, ShieldCheck, Lock, DollarSign, Globe, Check } from 'lucide-react';

interface Props {
  settings: any;
  webhookSecret: string;
  lang: Language;
  onUpdateSettings: (newSettings: any) => Promise<void>;
}

export const ApiConfigPage: React.FC<Props> = ({
  settings,
  webhookSecret,
  lang,
  onUpdateSettings,
}) => {
  const t = translations[lang];
  const [liveMode, setLiveMode] = useState(settings?.liveMode ?? false);
  const [autoExec, setAutoExec] = useState(settings?.autoExecutionEnabled ?? true);
  const [manualReview, setManualReview] = useState(settings?.requireManualSubmissionReview ?? false);
  const [strictAlgeria, setStrictAlgeria] = useState(settings?.strictAlgeriaCompliance ?? true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      liveMode,
      autoExecutionEnabled: autoExec,
      requireManualSubmissionReview: manualReview,
      strictAlgeriaCompliance: strictAlgeria,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>{t.nav.apiConfig}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'تكوين بيئة التشغيل الآمنة، حماية التكاليف الصفرية، وسياسات الامتثال للجمهورية الجزائرية.'
            : 'Operational security parameters, zero-cost budget enforcement, and legal compliance configuration.'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Cost Budget Safeguard */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'ar' ? 'ضوابط التكلفة الصفرية (Zero-Cost Budget Guard)' : 'Zero-Cost Free Tier Safeguards'}</span>
          </div>
          <p className="text-2xs text-slate-400 leading-relaxed">
            {lang === 'ar'
              ? 'المحرك مبرمج ليعمل حصراً على الشرائح المجانية (Gemini Free Quota, GitHub Free API). محظور شراء أي اشتراكات أو اعتمادات أو دفع رسوم غاز تلقائياً.'
              : 'The system operates exclusively within free tiers (Gemini free quota, GitHub unauthenticated/personal rate limits). Zero automatic upgrades or paid subscriptions.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-2xs font-mono">
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-slate-500 block">Monthly Operating Budget Cap</span>
              <span className="text-emerald-400 font-bold text-sm">$0.00 (Hard Stop Threshold)</span>
            </div>
            <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
              <span className="text-slate-500 block">Operator Deposit Prevention</span>
              <span className="text-cyan-400 font-bold text-sm">ENFORCED (Rejects pay-to-work tasks)</span>
            </div>
          </div>
        </div>

        {/* Server Injected Credentials Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'ar' ? 'حالة أسرار الخادم المؤمنة' : 'Server-Side Credentials Security'}</span>
          </div>
          <p className="text-2xs text-slate-400">
            {lang === 'ar'
              ? 'وفق إرشادات الأمان، تظل جميع المفاتيح مخزنة في بيئة الخادم المشفرة دون كشفها للمتصفح.'
              : 'All API keys remain securely on the server and are never exposed to browser client bundles.'}
          </p>
          <div className="space-y-2 pt-1 text-2xs font-mono">
            <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-slate-300">GEMINI_API_KEY</span>
              <span className="text-emerald-400 font-semibold">CONFIGURED ON SERVER</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-slate-300">N8N_WEBHOOK_SECRET</span>
              <span className="text-cyan-400 select-all font-semibold">{webhookSecret}</span>
            </div>
          </div>
        </div>

        {/* Jurisdiction & Legal Compliance */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ar' ? 'الامتثال القانوني والقضائي (الجزائر)' : 'Jurisdiction & Regulatory Mandate'}</span>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={strictAlgeria}
              onChange={(e) => setStrictAlgeria(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200">
                {lang === 'ar' ? 'تفعيل الامتثال الصارم لقوانين الصرف الجزائرية' : 'Enforce strict Algerian banking regulations'}
              </span>
              <p className="text-2xs text-slate-400 mt-0.5">
                {lang === 'ar'
                  ? 'حظر تحويلات العملات المشفرة و USDT غير المرخصة، وقصر السحوبات على التحويلات المصرفية المباشرة (SWIFT/SEPA/Stripe) للبنوك المعتمدة.'
                  : 'Prohibits unauthorized virtual-asset / USDT transfers; mandates compliant direct bank wire (SWIFT/SEPA) payouts.'}
              </p>
            </div>
          </label>
        </div>

        {/* Automation Mode Toggles */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider">
            {lang === 'ar' ? 'أوضاع التشغيل' : 'Execution Engine Modes'}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoExec}
              onChange={(e) => setAutoExec(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200">
                {lang === 'ar' ? 'التنفيذ التلقائي للمهام المؤهلة' : 'Automatic AI execution for policy-eligible tasks'}
              </span>
              <p className="text-2xs text-slate-400 mt-0.5">
                {lang === 'ar' ? 'تنفيذ المهام الآمنة تلقائياً دون الحاجة لتدخل بشري.' : 'Run approved tasks without requiring manual operator clicks.'}
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={liveMode}
              onChange={(e) => setLiveMode(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200">
                {lang === 'ar' ? 'الوضع الحي (Live Production Mode)' : 'Live Production Mode'}
              </span>
              <p className="text-2xs text-slate-400 mt-0.5">
                {lang === 'ar' ? 'التبديل بين وضع التدقيق/المحاكاة ووضع الإنتاج الحي.' : 'Switch from audit simulation to live production dispatching.'}
              </p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 transition shadow-sm"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{isSaved ? (lang === 'ar' ? 'تم الحفظ بنجاح' : 'Settings Saved') : t.actions.saveSettings}</span>
        </button>
      </form>
    </div>
  );
};
