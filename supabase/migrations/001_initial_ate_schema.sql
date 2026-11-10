-- ====================================================================
-- ATE – AUTONOMOUS TASK EARNING ENGINE
-- Production Supabase / PostgreSQL Database Migration
-- Version: 001_initial_ate_schema.sql
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Providers Table
CREATE TABLE IF NOT EXISTS ate_providers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(64) NOT NULL, -- 'algora', 'github_bounty', 'custom_webhook'
    base_url TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'active', -- 'active', 'paused', 'error'
    rate_limit_remaining INT DEFAULT 5000,
    rate_limit_reset TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS ate_tasks (
    id VARCHAR(128) PRIMARY KEY,
    provider_id VARCHAR(64) REFERENCES ate_providers(id) ON DELETE SET NULL,
    task_id VARCHAR(128) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    funding_status VARCHAR(32) NOT NULL, -- 'funded', 'escrowed', 'pledged', 'unverified'
    deadline TIMESTAMPTZ,
    source_url TEXT NOT NULL,
    source_repo TEXT,
    source_issue_number INT,
    country_eligibility JSONB DEFAULT '{"algeria_allowed": true, "restricted": []}'::jsonb,
    automation_permission VARCHAR(32) NOT NULL, -- 'explicitly_permitted', 'prohibited', 'unclear', 'human_only'
    submission_type VARCHAR(64) NOT NULL, -- 'pull_request', 'api_webhook', 'patch_bundle'
    policy_status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'passed', 'rejected', 'review_required'
    policy_rejection_reasons JSONB DEFAULT '[]'::jsonb,
    execution_status VARCHAR(32) NOT NULL DEFAULT 'discovered', 
    -- 'discovered', 'eligible', 'planning', 'executing', 'completed', 'submitted', 'accepted', 'rejected', 'payment_verified'
    difficulty_score INT DEFAULT 1, -- 1 (easy) to 5 (complex)
    estimated_minutes INT DEFAULT 15,
    is_test_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Execution Plans & Deliverables
CREATE TABLE IF NOT EXISTS ate_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(128) REFERENCES ate_tasks(id) ON DELETE CASCADE,
    agent_model VARCHAR(64) NOT NULL DEFAULT 'gemini-3.8-flash',
    plan_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    deliverable_files JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_hash VARCHAR(64), -- SHA-256 deliverable checksum
    execution_time_ms INT DEFAULT 0,
    sandbox_verified BOOLEAN DEFAULT false,
    quality_checks JSONB DEFAULT '[]'::jsonb,
    submission_payload JSONB DEFAULT '{}'::jsonb,
    submission_reference TEXT, -- e.g. PR URL or Webhook ack ID
    submitted_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed', 'submitted', 'verified'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Financial Ledger (Double-Entry / Categorized Balances)
CREATE TABLE IF NOT EXISTS ate_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(128) REFERENCES ate_tasks(id) ON DELETE SET NULL,
    entry_type VARCHAR(32) NOT NULL, 
    -- 'advertised_reward', 'pending_reward', 'accepted_reward', 'payment_received', 'withdrawable_balance', 'operating_cost'
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    verification_method VARCHAR(64), -- 'bank_wire', 'stripe_transfer', 'wise_payout', 'escrow_release'
    verification_evidence TEXT, -- Documented confirmation / Provider settlement reference
    counterparty VARCHAR(128) NOT NULL,
    compliance_check_algeria BOOLEAN DEFAULT true, -- Enforces fiat/authorized channels only
    is_test_data BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. n8n Workflows & Webhook Logs
CREATE TABLE IF NOT EXISTS ate_n8n_workflows (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    webhook_path VARCHAR(128) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    workflow_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ate_system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(16) NOT NULL, -- 'info', 'warn', 'error', 'security'
    category VARCHAR(64) NOT NULL, -- 'discovery', 'policy', 'execution', 'payment', 'n8n'
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_execution_status ON ate_tasks(execution_status);
CREATE INDEX IF NOT EXISTS idx_tasks_policy_status ON ate_tasks(policy_status);
CREATE INDEX IF NOT EXISTS idx_ledger_entry_type ON ate_ledger(entry_type);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON ate_system_logs(created_at DESC);
