import React, { useState } from 'react';
import { N8NWorkflowDefinition } from '../types';
import { Language, translations } from '../i18n/translations';
import { 
  GitFork, 
  Play, 
  Download, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Code2, 
  X 
} from 'lucide-react';

interface Props {
  workflows: N8NWorkflowDefinition[];
  webhookSecret: string;
  lang: Language;
  onTrigger: (id: string) => Promise<void>;
}

export const WorkflowsPage: React.FC<Props> = ({
  workflows,
  webhookSecret,
  lang,
  onTrigger,
}) => {
  const t = translations[lang];
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [inspectWorkflow, setInspectWorkflow] = useState<N8NWorkflowDefinition | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleTrigger = async (id: string) => {
    setTriggeringId(id);
    await onTrigger(id);
    setTriggeringId(null);
  };

  const copyWebhookUrl = (path: string) => {
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const downloadJson = (wf: N8NWorkflowDefinition) => {
    const blob = new Blob([JSON.stringify(wf.workflowJson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wf.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <GitFork className="w-5 h-5 text-cyan-400" />
          <span>{t.nav.workflows}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ar'
            ? 'مخططات أتمتة n8n السبعة المستقلة القابلة للاستيراد المباشر والمجهزة بنقاط نهاية الويب هوك والتحقق من التكرار والتعافي من الأخطاء.'
            : 'Seven independent production n8n workflows with webhook endpoints, retry policies, deduplication guards, and exportable JSON templates.'}
        </p>
      </div>

      {/* Webhook Secret Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-semibold text-slate-200">
            {lang === 'ar' ? 'مفتاح مصادقة n8n Webhook المشترك:' : 'n8n Shared Webhook Secret Key:'}
          </span>
          <span className="font-mono text-cyan-400 ps-2 select-all text-2xs">{webhookSecret}</span>
        </div>
        <span className="text-3xs text-slate-500">
          {lang === 'ar' ? 'يتم التحقق عبر ترويسة Authorization: Bearer' : 'Enforced via Authorization: Bearer header'}
        </span>
      </div>

      {/* Workflows List */}
      <div className="grid grid-cols-1 gap-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-2xs text-slate-400 flex-wrap">
                <span className="font-semibold text-cyan-400">{wf.triggerType.toUpperCase()} TRIGGER</span>
                <span>·</span>
                <span className="font-mono text-slate-300">ID: {wf.id}</span>
                <span>·</span>
                <span className="text-emerald-400 font-mono tabular-nums">
                  {wf.successCount} {lang === 'ar' ? 'تشغيل ناجح' : 'successful runs'}
                </span>
                {wf.lastTriggeredAt && (
                  <>
                    <span>·</span>
                    <span>Last run: {new Date(wf.lastTriggeredAt).toLocaleTimeString()}</span>
                  </>
                )}
              </div>

              <h3 className="text-sm font-bold text-white">{wf.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{wf.description}</p>

              {/* Webhook endpoint URL */}
              <div className="pt-2 flex items-center gap-2 text-2xs font-mono text-slate-400">
                <span className="text-slate-500">Webhook:</span>
                <code className="rounded bg-slate-950 px-2 py-0.5 text-slate-300 border border-slate-800">
                  {wf.webhookPath}
                </code>
                <button
                  onClick={() => copyWebhookUrl(wf.webhookPath)}
                  className="text-slate-400 hover:text-cyan-400 transition"
                  title="Copy full webhook URL"
                >
                  {copiedPath === wf.webhookPath ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => setInspectWorkflow(wf)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Inspect JSON Schema"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                onClick={() => downloadJson(wf)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Download importable n8n workflow file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تصدير' : 'Export'}</span>
              </button>

              <button
                onClick={() => handleTrigger(wf.id)}
                disabled={triggeringId === wf.id}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition shadow-xs"
              >
                <Play className={`w-3.5 h-3.5 ${triggeringId === wf.id ? 'animate-spin' : ''}`} />
                <span>{triggeringId === wf.id ? (lang === 'ar' ? 'جاري التشغيل...' : 'Running...') : t.actions.triggerWorkflow}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* JSON Viewer Modal */}
      {inspectWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>{inspectWorkflow.name} – n8n Schema</span>
              </h2>
              <button
                onClick={() => setInspectWorkflow(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="mt-4 flex-1 overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-2xs text-slate-300 leading-relaxed border border-slate-800">
              <code>{JSON.stringify(inspectWorkflow.workflowJson, null, 2)}</code>
            </pre>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => downloadJson(inspectWorkflow)}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.actions.downloadJson}</span>
              </button>
              <button
                onClick={() => setInspectWorkflow(null)}
                className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                {t.actions.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
