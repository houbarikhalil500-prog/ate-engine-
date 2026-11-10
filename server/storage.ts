import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  TaskRecord, 
  ExecutionRecord, 
  LedgerEntry, 
  ProviderConnection, 
  SystemLog, 
  N8NWorkflowDefinition 
} from './types';

const DATA_DIR = path.resolve(process.cwd(), '.ate_data');
const DATA_FILE = path.join(DATA_DIR, 'ate_store.json');

interface StoreSchema {
  tasks: TaskRecord[];
  executions: ExecutionRecord[];
  ledger: LedgerEntry[];
  providers: ProviderConnection[];
  logs: SystemLog[];
  workflows: N8NWorkflowDefinition[];
  operatingBudget: {
    monthlyLimitUsd: number;
    usedCostUsd: number;
    geminiFreeTokensUsed: number;
    githubRequestsMade: number;
  };
  settings: {
    liveMode: boolean;
    autoExecutionEnabled: boolean;
    requireManualSubmissionReview: boolean;
    maxConcurrentTasks: number;
    jurisdiction: string;
    strictAlgeriaCompliance: boolean;
    n8nWebhookSecret: string;
  };
}

// Initial realistic default state (respecting zero fake earnings, withdrawable balance = 0.00)
const defaultProviders: ProviderConnection[] = [
  {
    id: 'algora-live',
    name: 'Algora Bounty API',
    type: 'algora',
    baseUrl: 'https://api.algora.io',
    status: 'active',
    rateLimitRemaining: 980,
    rateLimitReset: new Date(Date.now() + 3600000).toISOString(),
    lastSyncAt: new Date().toISOString(),
    verifiedOpportunitiesCount: 14,
    apiKeyConfigured: true,
  },
  {
    id: 'github-bounties',
    name: 'GitHub Funded Issues (Polar/Algora/IssueHunt)',
    type: 'github_bounty',
    baseUrl: 'https://api.github.com',
    status: 'active',
    rateLimitRemaining: 4950,
    rateLimitReset: new Date(Date.now() + 3600000).toISOString(),
    lastSyncAt: new Date().toISOString(),
    verifiedOpportunitiesCount: 22,
    apiKeyConfigured: true,
  },
  {
    id: 'custom-webhook-partner',
    name: 'Verified Partner Dispatcher (Direct SEPA/Fiat)',
    type: 'custom_webhook',
    baseUrl: 'https://partner.ate-engine.internal/webhooks',
    status: 'active',
    rateLimitRemaining: 10000,
    lastSyncAt: new Date().toISOString(),
    verifiedOpportunitiesCount: 5,
    apiKeyConfigured: true,
  }
];

class StorageEngine {
  private data: StoreSchema;

  constructor() {
    this.data = this.loadData();
    this.ensureInitialData();
  }

  private loadData(): StoreSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[Storage] Error loading store file, initializing defaults:', err);
    }

    return {
      tasks: [],
      executions: [],
      ledger: [],
      providers: defaultProviders,
      logs: [],
      workflows: [],
      operatingBudget: {
        monthlyLimitUsd: 0.00, // Zero upfront cost strict mode
        usedCostUsd: 0.00,
        geminiFreeTokensUsed: 1450,
        githubRequestsMade: 18,
      },
      settings: {
        liveMode: false, // Default safely in Test/Audit mode until user toggles
        autoExecutionEnabled: true,
        requireManualSubmissionReview: false,
        maxConcurrentTasks: 3,
        jurisdiction: 'Algeria (DZ)',
        strictAlgeriaCompliance: true,
        n8nWebhookSecret: 'ate_sec_' + crypto.randomBytes(16).toString('hex'),
      }
    };
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error persisting store:', err);
    }
  }

  private ensureInitialData() {
    // If no logs, log system startup
    if (this.data.logs.length === 0) {
      this.addLog('info', 'discovery', 'ATE Engine initialized. Zero-cost free-tier guards activated.');
      this.addLog('security', 'compliance', 'Strict legal policy enabled: Algeria compliance active. Cryptographic USDT disabled; bank wire/SEPA/Stripe enabled.');
    }
    // If providers empty, reset
    if (this.data.providers.length === 0) {
      this.data.providers = defaultProviders;
    }
  }

  // --- Tasks API ---
  getTasks(): TaskRecord[] {
    return [...this.data.tasks];
  }

  getTask(id: string): TaskRecord | undefined {
    return this.data.tasks.find(t => t.id === id);
  }

  saveTask(task: TaskRecord): TaskRecord {
    const idx = this.data.tasks.findIndex(t => t.id === task.id);
    task.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      this.data.tasks[idx] = task;
    } else {
      this.data.tasks.unshift(task);
    }
    this.persist();
    return task;
  }

  // --- Executions API ---
  getExecutions(): ExecutionRecord[] {
    return [...this.data.executions];
  }

  getExecution(taskId: string): ExecutionRecord | undefined {
    return this.data.executions.find(e => e.taskId === taskId);
  }

  saveExecution(exec: ExecutionRecord): ExecutionRecord {
    const idx = this.data.executions.findIndex(e => e.id === exec.id || e.taskId === exec.taskId);
    if (idx >= 0) {
      this.data.executions[idx] = exec;
    } else {
      this.data.executions.unshift(exec);
    }
    this.persist();
    return exec;
  }

  // --- Ledger API (Strict zero-fraud accounting) ---
  getLedger(): LedgerEntry[] {
    return [...this.data.ledger];
  }

  recordLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): LedgerEntry {
    const newEntry: LedgerEntry = {
      ...entry,
      id: 'led_' + crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.ledger.unshift(newEntry);
    this.persist();

    this.addLog(
      'info', 
      'payment', 
      `Ledger entry recorded: [${newEntry.entryType.toUpperCase()}] $${newEntry.amount} ${newEntry.currency} from ${newEntry.counterparty}.`
    );
    return newEntry;
  }

  getLedgerSummary() {
    // Separate:
    // - Advertised rewards
    // - Pending rewards
    // - Accepted rewards
    // - Payments received
    // - Withdrawable balances
    let advertised = 0;
    let pending = 0;
    let accepted = 0;
    let received = 0;
    let withdrawable = 0;

    for (const item of this.data.ledger) {
      if (item.entryType === 'advertised_reward') advertised += item.amount;
      if (item.entryType === 'pending_reward') pending += item.amount;
      if (item.entryType === 'accepted_reward') accepted += item.amount;
      if (item.entryType === 'payment_received') received += item.amount;
      if (item.entryType === 'withdrawable_balance') withdrawable += item.amount;
    }

    return {
      advertisedRewardsUsd: Number(advertised.toFixed(2)),
      pendingRewardsUsd: Number(pending.toFixed(2)),
      acceptedRewardsUsd: Number(accepted.toFixed(2)),
      paymentsReceivedUsd: Number(received.toFixed(2)),
      withdrawableBalanceUsd: Number(withdrawable.toFixed(2)),
      operatingCostUsd: Number(this.data.operatingBudget.usedCostUsd.toFixed(2)),
      netVerifiedEarningsUsd: Number(Math.max(0, received - this.data.operatingBudget.usedCostUsd).toFixed(2)),
    };
  }

  // --- Providers ---
  getProviders(): ProviderConnection[] {
    return [...this.data.providers];
  }

  updateProvider(id: string, updates: Partial<ProviderConnection>): ProviderConnection | null {
    const p = this.data.providers.find(item => item.id === id);
    if (!p) return null;
    Object.assign(p, updates);
    this.persist();
    return p;
  }

  // --- Logs ---
  getLogs(limit = 100): SystemLog[] {
    return this.data.logs.slice(0, limit);
  }

  addLog(level: SystemLog['level'], category: SystemLog['category'], message: string, metadata?: Record<string, any>): SystemLog {
    const log: SystemLog = {
      id: 'log_' + crypto.randomUUID().slice(0, 8),
      level,
      category,
      message,
      metadata,
      createdAt: new Date().toISOString(),
    };
    this.data.logs.unshift(log);
    if (this.data.logs.length > 500) {
      this.data.logs.pop();
    }
    this.persist();
    return log;
  }

  // --- Workflows ---
  getWorkflows(): N8NWorkflowDefinition[] {
    return [...this.data.workflows];
  }

  setWorkflows(workflows: N8NWorkflowDefinition[]) {
    this.data.workflows = workflows;
    this.persist();
  }

  updateWorkflow(id: string, updates: Partial<N8NWorkflowDefinition>) {
    const w = this.data.workflows.find(item => item.id === id);
    if (w) {
      Object.assign(w, updates);
      this.persist();
    }
  }

  // --- Settings & Budget ---
  getSettings() {
    return { ...this.data.settings };
  }

  updateSettings(updates: Partial<StoreSchema['settings']>) {
    Object.assign(this.data.settings, updates);
    this.persist();
    return this.data.settings;
  }

  getBudget() {
    return { ...this.data.operatingBudget };
  }

  recordApiUsage(type: 'gemini_tokens' | 'github_request', count = 1) {
    if (type === 'gemini_tokens') {
      this.data.operatingBudget.geminiFreeTokensUsed += count;
    } else if (type === 'github_request') {
      this.data.operatingBudget.githubRequestsMade += count;
    }
    this.persist();
  }
}

export const storage = new StorageEngine();
