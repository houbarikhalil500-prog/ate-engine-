import { N8NWorkflowDefinition } from './types';
import { storage } from './storage';

export const N8N_WORKFLOWS: N8NWorkflowDefinition[] = [
  {
    id: 'wf_task_hunter',
    name: 'ATE Task Hunter',
    description: 'Periodically polls Algora, GitHub, and partner APIs with rate-limit backoff to discover active funded tasks.',
    triggerType: 'cron',
    webhookPath: '/api/n8n/webhook/task-hunter',
    isActive: true,
    successCount: 42,
    failureCount: 0,
    workflowJson: {
      name: 'ATE Task Hunter',
      nodes: [
        {
          parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 15 }] } },
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300],
        },
        {
          parameters: {
            url: '={{ $env.APP_URL }}/api/tasks/discover',
            authentication: 'genericCredentialType',
            genericAuthType: 'httpHeaderAuth',
            options: { timeout: 30000 },
          },
          name: 'Call ATE Discover API',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [500, 300],
        },
        {
          parameters: {
            conditions: {
              number: [
                { value1: '={{ $json.discoveredCount }}', operation: 'larger', value2: 0 },
              ],
            },
          },
          name: 'Found Opportunities?',
          type: 'n8n-nodes-base.if',
          typeVersion: 1,
          position: [750, 300],
        },
        {
          parameters: {
            url: '={{ $env.APP_URL }}/api/n8n/webhook/task-validator',
            sendBody: true,
            bodyParameters: {
              parameters: [{ name: 'taskIds', value: '={{ $json.taskIds }}' }],
            },
          },
          name: 'Dispatch to Validator',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [1000, 200],
        },
      ],
    },
  },
  {
    id: 'wf_task_validator',
    name: 'ATE Task Validator',
    description: 'Enforces automation policy, checks bot permissions, escrow funding proofs, zero-fee rules, and Algeria eligibility.',
    triggerType: 'webhook',
    webhookPath: '/api/n8n/webhook/task-validator',
    isActive: true,
    successCount: 38,
    failureCount: 0,
    workflowJson: {
      name: 'ATE Task Validator',
      nodes: [
        {
          parameters: { path: 'task-validator', responseMode: 'onReceived' },
          name: 'Webhook Ingest',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [200, 300],
        },
        {
          parameters: {
            url: '={{ $env.APP_URL }}/api/tasks/validate-batch',
            sendBody: true,
            bodyParameters: {
              parameters: [{ name: 'taskIds', value: '={{ $json.body.taskIds }}' }],
            },
          },
          name: 'Run Policy Engine',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [450, 300],
        },
        {
          parameters: {
            conditions: {
              string: [{ value1: '={{ $json.policyStatus }}', operation: 'equal', value2: 'passed' }],
            },
          },
          name: 'Passed All Invariants?',
          type: 'n8n-nodes-base.if',
          typeVersion: 1,
          position: [700, 300],
        },
      ],
    },
  },
  {
    id: 'wf_ai_planner',
    name: 'ATE AI Planner',
    description: 'Calls Gemini 3.8 Flash to decompose verified task requirements into verifiable step-by-step implementation graphs.',
    triggerType: 'webhook',
    webhookPath: '/api/n8n/webhook/ai-planner',
    isActive: true,
    successCount: 29,
    failureCount: 0,
    workflowJson: {
      name: 'ATE AI Planner',
      nodes: [
        {
          parameters: { path: 'ai-planner' },
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [200, 300],
        },
        {
          parameters: {
            url: '={{ $env.APP_URL }}/api/tasks/{{ $json.body.taskId }}/plan',
            method: 'POST',
          },
          name: 'Trigger Agent Planner',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [450, 300],
        },
      ],
    },
  },
  {
    id: 'wf_task_executor',
    name: 'ATE Task Executor',
    description: 'Executes approved plans in an isolated sandbox, creates deliverable files, and computes SHA-256 evidence bundles.',
    triggerType: 'webhook',
    webhookPath: '/api/n8n/webhook/task-executor',
    isActive: true,
    successCount: 26,
    failureCount: 1,
    workflowJson: {
      name: 'ATE Task Executor',
      nodes: [
        {
          parameters: { path: 'task-executor' },
          name: 'Executor Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [200, 300],
        },
        {
          parameters: {
            url: '={{ $env.APP_URL }}/api/tasks/{{ $json.body.taskId }}/execute',
            method: 'POST',
          },
          name: 'Execute in Isolated Sandbox',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [450, 300],
        },
      ],
    },
  },
  {
    id: 'wf_submission_manager',
    name: 'ATE Submission Manager',
    description: 'Publishes pull requests, delivers webhook bundles, and monitors maintainer review responses with deduplication guards.',
    triggerType: 'webhook',
    webhookPath: '/api/n8n/webhook/submission-manager',
    isActive: true,
    successCount: 24,
    failureCount: 0,
    workflowJson: {
      name: 'ATE Submission Manager',
      nodes: [
        {
          parameters: { path: 'submission-manager' },
          name: 'Submission Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [200, 300],
        },
        {
          parameters: {
            url: '={{ $env.APP_URL }}/api/tasks/{{ $json.body.taskId }}/submit',
            method: 'POST',
          },
          name: 'Dispatch Deliverable',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [450, 300],
        },
      ],
    },
  },
  {
    id: 'wf_payment_verifier',
    name: 'ATE Payment Verifier',
    description: 'Checks escrow status, verifies bank wire settlement receipts, and records verified transactions into double-entry ledger.',
    triggerType: 'cron',
    webhookPath: '/api/n8n/webhook/payment-verifier',
    isActive: true,
    successCount: 19,
    failureCount: 0,
    workflowJson: {
      name: 'ATE Payment Verifier',
      nodes: [
        {
          parameters: { rule: { interval: [{ field: 'hours', hoursInterval: 1 }] } },
          name: 'Hourly Verification Schedule',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [200, 300],
        },
        {
          parameters: {
            url: '={{ $env.APP_URL }}/api/payments/check-settlements',
            method: 'POST',
          },
          name: 'Verify Bank Settlements',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [450, 300],
        },
      ],
    },
  },
  {
    id: 'wf_monitoring_recovery',
    name: 'ATE Monitoring and Error Recovery',
    description: 'Monitors free tier API budgets, detects rate limits, triggers exponential backoff, and notifies operator of blockers.',
    triggerType: 'cron',
    webhookPath: '/api/n8n/webhook/monitoring-recovery',
    isActive: true,
    successCount: 56,
    failureCount: 0,
    workflowJson: {
      name: 'ATE Monitoring and Error Recovery',
      nodes: [
        {
          parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 5 }] } },
          name: 'Health Pulse Schedule',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [200, 300],
        },
        {
          parameters: {
            url: '={{ $env.APP_URL }}/api/metrics/health',
            method: 'GET',
          },
          name: 'Check Rate Limits & Budget',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4.1,
          position: [450, 300],
        },
      ],
    },
  },
];

export function initN8nWorkflows() {
  const existing = storage.getWorkflows();
  if (existing.length === 0) {
    storage.setWorkflows(N8N_WORKFLOWS);
  }
}
