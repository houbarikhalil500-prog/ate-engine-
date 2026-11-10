export type TabType = 
  | 'dashboard'
  | 'discovery'
  | 'eligible'
  | 'running'
  | 'completed'
  | 'submissions'
  | 'payments'
  | 'ledger'
  | 'workflows'
  | 'providers'
  | 'api_config'
  | 'logs'
  | 'monitoring'
  | 'account';

export type FundingStatus = 'funded' | 'escrowed' | 'pledged' | 'unverified';
export type AutomationPermission = 'explicitly_permitted' | 'prohibited' | 'unclear' | 'human_only';
export type PolicyStatus = 'passed' | 'rejected' | 'review_required';
export type ExecutionStatus = 
  | 'discovered' 
  | 'eligible' 
  | 'planning' 
  | 'executing' 
  | 'completed' 
  | 'submitted' 
  | 'accepted' 
  | 'rejected' 
  | 'payment_verified';

export interface TaskPolicyResult {
  ruleCode: string;
  ruleName: string;
  passed: boolean;
  reason: string;
  checkedAt: string;
}

export interface TaskRecord {
  id: string;
  providerId: string;
  taskId: string;
  title: string;
  description: string;
  rewardAmount: number;
  currency: string;
  fundingStatus: FundingStatus;
  deadline?: string;
  sourceUrl: string;
  sourceRepo?: string;
  sourceIssueNumber?: number;
  countryEligibility: {
    algeriaAllowed: boolean;
    restrictedCountries: string[];
    notes?: string;
  };
  automationPermission: AutomationPermission;
  submissionType: 'pull_request' | 'api_webhook' | 'patch_bundle';
  submissionRequirements: string;
  policyStatus: PolicyStatus;
  policyResults: TaskPolicyResult[];
  policyRejectionReasons: string[];
  executionStatus: ExecutionStatus;
  difficultyScore: number;
  estimatedMinutes: number;
  isTestMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionPlanStep {
  stepNumber: number;
  title: string;
  description: string;
  action: 'analyze' | 'generate_code' | 'sandbox_test' | 'bundle_deliverable' | 'verify_quality';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: string;
}

export interface DeliverableFile {
  filename: string;
  path: string;
  content: string;
  sha256: string;
}

export interface ExecutionRecord {
  id: string;
  taskId: string;
  agentModel: string;
  planSteps: ExecutionPlanStep[];
  deliverables: DeliverableFile[];
  evidenceHash: string;
  executionTimeMs: number;
  sandboxVerified: boolean;
  qualityChecks: {
    name: string;
    passed: boolean;
    details: string;
  }[];
  submissionPayload?: {
    pullRequestTitle?: string;
    pullRequestBody?: string;
    branchName?: string;
    commitMessage?: string;
    deliverableUrl?: string;
  };
  submissionReference?: string;
  submittedAt?: string;
  acceptedAt?: string;
  status: 'in_progress' | 'completed' | 'failed' | 'submitted' | 'verified';
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  taskId?: string;
  taskTitle?: string;
  entryType: 
    | 'advertised_reward' 
    | 'pending_reward' 
    | 'accepted_reward' 
    | 'payment_received' 
    | 'withdrawable_balance' 
    | 'operating_cost';
  amount: number;
  currency: string;
  verificationMethod?: 'bank_wire' | 'stripe_transfer' | 'wise_payout' | 'escrow_release' | 'provider_direct';
  verificationEvidence?: string;
  counterparty: string;
  complianceCheckAlgeria: boolean;
  isTestData: boolean;
  notes: string;
  createdAt: string;
}

export interface LedgerSummary {
  advertisedRewardsUsd: number;
  pendingRewardsUsd: number;
  acceptedRewardsUsd: number;
  paymentsReceivedUsd: number;
  withdrawableBalanceUsd: number;
  operatingCostUsd: number;
  netVerifiedEarningsUsd: number;
}

export interface ProviderConnection {
  id: string;
  name: string;
  type: 'algora' | 'github_bounty' | 'custom_webhook';
  baseUrl: string;
  status: 'active' | 'paused' | 'error';
  rateLimitRemaining: number;
  rateLimitReset?: string;
  lastSyncAt?: string;
  verifiedOpportunitiesCount: number;
  apiKeyConfigured: boolean;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'security';
  category: 'discovery' | 'policy' | 'execution' | 'payment' | 'n8n' | 'compliance';
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface N8NWorkflowDefinition {
  id: string;
  name: string;
  description: string;
  triggerType: 'webhook' | 'cron' | 'event';
  webhookPath: string;
  isActive: boolean;
  lastTriggeredAt?: string;
  successCount: number;
  failureCount: number;
  workflowJson: Record<string, any>;
}

export interface SystemMetrics {
  totalDiscovered: number;
  eligibleOpportunities: number;
  successfulExecutions: number;
  rejectedTasks: number;
  acceptedSubmissions: number;
  actualMoneyReceived: number;
  withdrawableBalance: number;
  operatingCosts: number;
  netVerifiedEarnings: number;
  geminiTokensUsed: number;
  githubRequestsMade: number;
}
