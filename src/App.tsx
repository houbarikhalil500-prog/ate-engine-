import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  TaskRecord, 
  ExecutionRecord, 
  LedgerEntry, 
  LedgerSummary, 
  SystemMetrics, 
  ProviderConnection, 
  SystemLog, 
  N8NWorkflowDefinition 
} from './types';
import { Language, translations } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AcceptanceTestModal } from './components/AcceptanceTestModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TaskDiscoveryPage } from './pages/TaskDiscoveryPage';
import { EligibleTasksPage } from './pages/EligibleTasksPage';
import { RunningTasksPage } from './pages/RunningTasksPage';
import { CompletedTasksPage } from './pages/CompletedTasksPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { VerifiedPaymentsPage } from './pages/VerifiedPaymentsPage';
import { FinancialLedgerPage } from './pages/FinancialLedgerPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { ApiConfigPage } from './pages/ApiConfigPage';
import { ExecutionLogsPage } from './pages/ExecutionLogsPage';
import { SystemMonitoringPage } from './pages/SystemMonitoringPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [isAcceptanceTestOpen, setIsAcceptanceTestOpen] = useState(false);

  // Core Data State
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<LedgerSummary | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [providers, setProviders] = useState<ProviderConnection[]>([]);
  const [workflows, setWorkflows] = useState<N8NWorkflowDefinition[]>([]);
  const [webhookSecret, setWebhookSecret] = useState<string>('ate_sec_default');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // In-flight Action States
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);

  // Sync RTL / LTR direction with language
  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // Safe JSON fetcher that verifies headers and response body format
  const safeFetchJson = async <T,>(url: string, defaultValue: T): Promise<T> => {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) return defaultValue;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return defaultValue;
      const text = await res.text();
      const trimmed = text.trim();
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return defaultValue;
      return JSON.parse(trimmed) as T;
    } catch {
      return defaultValue;
    }
  };

  // Load all initial data from server
  const loadData = async () => {
    try {
      const [
        tasksRes,
        ledgerRes,
        metricsRes,
        providersRes,
        workflowsRes,
        logsRes,
        settingsRes,
      ] = await Promise.all([
        safeFetchJson<any>('/api/tasks', { success: false, tasks: [] }),
        safeFetchJson<any>('/api/ledger', { success: false, entries: [], summary: null }),
        safeFetchJson<any>('/api/metrics', { success: false, metrics: null }),
        safeFetchJson<any>('/api/providers', { success: false, providers: [] }),
        safeFetchJson<any>('/api/n8n/workflows', { success: false, workflows: [], webhookSecret: '' }),
        safeFetchJson<any>('/api/logs', { success: false, logs: [] }),
        safeFetchJson<any>('/api/settings', { success: false, settings: null }),
      ]);

      if (tasksRes?.success && Array.isArray(tasksRes.tasks)) setTasks(tasksRes.tasks);
      if (ledgerRes?.success) {
        if (Array.isArray(ledgerRes.entries)) setLedgerEntries(ledgerRes.entries);
        if (ledgerRes.summary) setLedgerSummary(ledgerRes.summary);
      }
      if (metricsRes?.success && metricsRes.metrics) setMetrics(metricsRes.metrics);
      if (providersRes?.success && Array.isArray(providersRes.providers)) setProviders(providersRes.providers);
      if (workflowsRes?.success) {
        if (Array.isArray(workflowsRes.workflows)) setWorkflows(workflowsRes.workflows);
        if (workflowsRes.webhookSecret) setWebhookSecret(workflowsRes.webhookSecret);
      }
      if (logsRes?.success && Array.isArray(logsRes.logs)) setLogs(logsRes.logs);
      if (settingsRes?.success && settingsRes.settings) {
        setSettings(settingsRes.settings);
        setIsLiveMode(settingsRes.settings?.liveMode ?? false);
      }
    } catch (err: any) {
      console.warn('[ATE Engine] Data load warning:', err?.message || err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Background refresh polling
    return () => clearInterval(interval);
  }, []);

  // Action: Trigger Discovery
  const handleDiscover = async (provider?: string) => {
    setIsDiscovering(true);
    try {
      const res = await fetch('/api/tasks/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ provider, liveMode: isLiveMode }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (data.success) {
        await loadData();
      }
    } catch (err) {
      console.warn('Discovery error:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Action: AI Execution
  const handleExecute = async (task: TaskRecord) => {
    setExecutingTaskId(task.id);
    try {
      const res = await fetch(`/api/tasks/${task.id}/execute`, { 
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json().catch(() => ({ success: false, error: 'Execution error' }));
      if (data.success) {
        if (data.execution) {
          setExecutions((prev) => [data.execution, ...prev.filter((e) => e.taskId !== task.id)]);
        }
        await loadData();
        setCurrentTab('completed');
      } else {
        alert(`Execution prohibited: ${data.error}`);
      }
    } catch (err) {
      console.warn('Execution error:', err);
    } finally {
      setExecutingTaskId(null);
    }
  };

  // Action: Re-validate Task Policy
  const handleValidate = async (task: TaskRecord) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/validate`, { 
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (data.success) {
        await loadData();
      }
    } catch (err) {
      console.warn('Validation error:', err);
    }
  };

  // Action: Submit Work Deliverable
  const handleSubmitWork = async (task: TaskRecord) => {
    setSubmittingTaskId(task.id);
    try {
      const res = await fetch(`/api/tasks/${task.id}/submit`, { 
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json().catch(() => ({ success: false, error: 'Submission error' }));
      if (data.success) {
        await loadData();
        setCurrentTab('submissions');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.warn('Submission error:', err);
    } finally {
      setSubmittingTaskId(null);
    }
  };

  // Action: Simulate Maintainer Acceptance
  const handleSimulateAcceptance = async (task: TaskRecord) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/simulate-acceptance`, { 
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (data.success) {
        await loadData();
      }
    } catch (err) {
      console.warn('Acceptance error:', err);
    }
  };

  // Action: Verify Payment Settlement
  const handleVerifyPayment = async (payload: {
    taskId: string;
    verificationMethod: any;
    settlementReference: string;
    amount: number;
    currency: string;
  }) => {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({ success: false, error: 'Payment response error' }));
    if (!data.success) {
      throw new Error(data.error || 'Payment verification failed');
    }
    await loadData();
  };

  // Action: Trigger n8n Workflow
  const handleTriggerWorkflow = async (id: string) => {
    const res = await fetch(`/api/n8n/trigger/${id}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      await loadData();
    }
  };

  // Action: Test Provider Ping
  const handleTestProvider = async (id: string) => {
    const res = await fetch(`/api/providers/${id}/test`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      await loadData();
    }
  };

  // Action: Update System Settings
  const handleUpdateSettings = async (newSettings: any) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    const data = await res.json();
    if (data.success) {
      setSettings(data.settings);
      setIsLiveMode(data.settings.liveMode);
      await loadData();
    }
  };

  // Action: Toggle Live Mode
  const handleToggleLiveMode = async () => {
    const nextMode = !isLiveMode;
    setIsLiveMode(nextMode);
    await handleUpdateSettings({ liveMode: nextMode });
  };

  // Render current tab content
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            metrics={metrics}
            ledgerSummary={ledgerSummary}
            recentTasks={tasks}
            lang={lang}
            onRefresh={loadData}
            onNavigateTab={setCurrentTab}
            onRunAcceptanceTest={() => setIsAcceptanceTestOpen(true)}
          />
        );
      case 'discovery':
        return (
          <TaskDiscoveryPage
            tasks={tasks}
            lang={lang}
            onRefresh={loadData}
            onDiscover={handleDiscover}
            onExecute={handleExecute}
            onValidate={handleValidate}
            isDiscovering={isDiscovering}
          />
        );
      case 'eligible':
        return (
          <EligibleTasksPage
            tasks={tasks}
            lang={lang}
            onExecute={handleExecute}
            isExecutingId={executingTaskId}
          />
        );
      case 'running':
        return (
          <RunningTasksPage
            tasks={tasks}
            executions={executions}
            lang={lang}
            onNavigateTab={setCurrentTab}
          />
        );
      case 'completed':
        return (
          <CompletedTasksPage
            tasks={tasks}
            executions={executions}
            lang={lang}
            onSubmit={handleSubmitWork}
            isSubmittingId={submittingTaskId}
          />
        );
      case 'submissions':
        return (
          <SubmissionsPage
            tasks={tasks}
            executions={executions}
            lang={lang}
            onSimulateAcceptance={handleSimulateAcceptance}
            onVerifyPayment={(tk) => {
              setCurrentTab('payments');
            }}
            onRefresh={loadData}
          />
        );
      case 'payments':
        return (
          <VerifiedPaymentsPage
            tasks={tasks}
            ledgerEntries={ledgerEntries}
            lang={lang}
            onVerifyPayment={handleVerifyPayment}
            onRefresh={loadData}
          />
        );
      case 'ledger':
        return (
          <FinancialLedgerPage
            ledgerEntries={ledgerEntries}
            summary={ledgerSummary}
            lang={lang}
          />
        );
      case 'workflows':
        return (
          <WorkflowsPage
            workflows={workflows}
            webhookSecret={webhookSecret}
            lang={lang}
            onTrigger={handleTriggerWorkflow}
          />
        );
      case 'providers':
        return (
          <ProvidersPage
            providers={providers}
            lang={lang}
            onTestProvider={handleTestProvider}
            onRefresh={loadData}
          />
        );
      case 'api_config':
        return (
          <ApiConfigPage
            settings={settings}
            webhookSecret={webhookSecret}
            lang={lang}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'logs':
        return (
          <ExecutionLogsPage
            logs={logs}
            lang={lang}
            onRefresh={loadData}
          />
        );
      case 'monitoring':
        return (
          <SystemMonitoringPage
            metrics={metrics}
            lang={lang}
            onRefresh={loadData}
          />
        );
      case 'account':
        return (
          <AccountSettingsPage
            ledgerEntries={ledgerEntries}
            lang={lang}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Strict 3-zone Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
        isLiveMode={isLiveMode}
        onToggleLiveMode={handleToggleLiveMode}
        onOpenAcceptanceTest={() => setIsAcceptanceTestOpen(true)}
      />

      {/* Main Layout: 240px Sidebar + Main Viewport */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          lang={lang}
          metrics={metrics}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
          {renderContent()}
        </main>
      </div>

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* 9-Step Final Acceptance Test Modal */}
      <AcceptanceTestModal
        isOpen={isAcceptanceTestOpen}
        onClose={() => setIsAcceptanceTestOpen(false)}
        lang={lang}
        onTestComplete={loadData}
      />
    </div>
  );
}
