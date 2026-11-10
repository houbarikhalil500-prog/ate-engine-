import { TaskRecord, TaskPolicyResult } from './types';

export class PolicyEngine {
  /**
   * Evaluates an opportunity against the ATE automation policy.
   * Returns an array of rule evaluations and overall policy status.
   */
  static evaluate(task: Partial<TaskRecord>): {
    policyStatus: 'passed' | 'rejected' | 'review_required';
    results: TaskPolicyResult[];
    rejectionReasons: string[];
  } {
    const results: TaskPolicyResult[] = [];
    const rejectionReasons: string[] = [];
    const now = new Date().toISOString();

    const titleAndDesc = `${task.title || ''} ${task.description || ''}`.toLowerCase();

    // RULE 1: Bot & Automation Permission
    const hasExplicitBotPermission = 
      task.automationPermission === 'explicitly_permitted' || 
      titleAndDesc.includes('bot permitted') ||
      titleAndDesc.includes('ai welcome') ||
      titleAndDesc.includes('automated pr accepted') ||
      titleAndDesc.includes('open to automated submissions');

    const prohibitsBots = 
      task.automationPermission === 'prohibited' ||
      task.automationPermission === 'human_only' ||
      titleAndDesc.includes('no bots') ||
      titleAndDesc.includes('no ai generated') ||
      titleAndDesc.includes('human only') ||
      titleAndDesc.includes('ai contributions will be rejected');

    if (prohibitsBots) {
      results.push({
        ruleCode: 'POL_001_NO_BOTS',
        ruleName: 'Bot Prohibition Check',
        passed: false,
        reason: 'Task explicitly prohibits AI agents or bot submissions.',
        checkedAt: now,
      });
      rejectionReasons.push('Explicit bot/AI prohibition by provider');
    } else if (hasExplicitBotPermission) {
      results.push({
        ruleCode: 'POL_001_NO_BOTS',
        ruleName: 'Bot Prohibition Check',
        passed: true,
        reason: 'Provider explicitly welcomes automated AI solvers.',
        checkedAt: now,
      });
    } else {
      results.push({
        ruleCode: 'POL_002_UNCLEAR_PERM',
        ruleName: 'Automation Permission Clarity',
        passed: false,
        reason: 'AI automation permission is unclear or not explicitly granted.',
        checkedAt: now,
      });
      rejectionReasons.push('Automation permission is ambiguous');
    }

    // RULE 2: Verifiable Reward & Funding Status
    const isFundedOrEscrowed = 
      task.fundingStatus === 'funded' || 
      task.fundingStatus === 'escrowed';

    if (isFundedOrEscrowed && (task.rewardAmount ?? 0) > 0) {
      results.push({
        ruleCode: 'POL_003_VERIFIABLE_REWARD',
        ruleName: 'Verifiable Reward Evidence',
        passed: true,
        reason: `Reward of $${task.rewardAmount} ${task.currency || 'USD'} is held in verified escrow/funded contract.`,
        checkedAt: now,
      });
    } else {
      results.push({
        ruleCode: 'POL_003_VERIFIABLE_REWARD',
        ruleName: 'Verifiable Reward Evidence',
        passed: false,
        reason: 'Reward is unfunded, pledged without escrow, or lacks verifiable cryptographic or financial evidence.',
        checkedAt: now,
      });
      rejectionReasons.push('Unverified funding or zero reward evidence');
    }

    // RULE 3: Upfront Fees / Deposits / Gas Payments Required from Operator (Zero-Fee Rule)
    const requiresUpfrontFee = 
      titleAndDesc.includes('pay fee') ||
      titleAndDesc.includes('registration fee') ||
      titleAndDesc.includes('pay gas') ||
      titleAndDesc.includes('deposit required') ||
      titleAndDesc.includes('send eth') ||
      titleAndDesc.includes('purchase tokens');

    if (requiresUpfrontFee) {
      results.push({
        ruleCode: 'POL_004_ZERO_UPFRONT_COST',
        ruleName: 'Zero Operator Upfront Cost',
        passed: false,
        reason: 'Task requires operator to pay fees, gas, or staking deposits. Stricly prohibited as predatory or scam.',
        checkedAt: now,
      });
      rejectionReasons.push('Demands operator deposit or fee (Scam/Pay-to-work pattern)');
    } else {
      results.push({
        ruleCode: 'POL_004_ZERO_UPFRONT_COST',
        ruleName: 'Zero Operator Upfront Cost',
        passed: true,
        reason: 'Zero upfront fees, gas payments, or staking required from the solver.',
        checkedAt: now,
      });
    }

    // RULE 4: Geographic & Algeria Eligibility
    const algeriaAllowed = task.countryEligibility?.algeriaAllowed !== false;
    const restrictedList = task.countryEligibility?.restrictedCountries || [];
    const excludesAlgeria = 
      restrictedList.some(c => c.toLowerCase().includes('algeria') || c.toLowerCase() === 'dz') ||
      titleAndDesc.includes('us only') ||
      titleAndDesc.includes('eu citizens only') ||
      titleAndDesc.includes('excluding algeria');

    if (!algeriaAllowed || excludesAlgeria) {
      results.push({
        ruleCode: 'POL_005_COUNTRY_ELIGIBILITY',
        ruleName: 'Algeria & Geographic Eligibility',
        passed: false,
        reason: 'Target country (Algeria) is explicitly restricted or excluded by the provider.',
        checkedAt: now,
      });
      rejectionReasons.push('Target jurisdiction (Algeria) excluded by task terms');
    } else {
      results.push({
        ruleCode: 'POL_005_COUNTRY_ELIGIBILITY',
        ruleName: 'Algeria & Geographic Eligibility',
        passed: true,
        reason: 'Country eligibility verified: Global / Algeria access permitted without sanctions barriers.',
        checkedAt: now,
      });
    }

    // RULE 5: Fraudulent Activity, Fake Engagement, Impersonation
    const isFraudulent = 
      titleAndDesc.includes('fake review') ||
      titleAndDesc.includes('app store review') ||
      titleAndDesc.includes('click farm') ||
      titleAndDesc.includes('bypass captcha') ||
      titleAndDesc.includes('solve captcha') ||
      titleAndDesc.includes('spoof') ||
      titleAndDesc.includes('impersonate') ||
      titleAndDesc.includes('social media engagement') ||
      titleAndDesc.includes('retweet bot');

    if (isFraudulent) {
      results.push({
        ruleCode: 'POL_006_NO_FRAUD',
        ruleName: 'Ethical & Anti-Fraud Compliance',
        passed: false,
        reason: 'Task involves fake engagement, captcha solving, deceptive identity, or unlawful spoofing.',
        checkedAt: now,
      });
      rejectionReasons.push('Deceptive, fake engagement, or captcha bypassing activity');
    } else {
      results.push({
        ruleCode: 'POL_006_NO_FRAUD',
        ruleName: 'Ethical & Anti-Fraud Compliance',
        passed: true,
        reason: 'Task is legitimate digital engineering, coding, testing, or content synthesis.',
        checkedAt: now,
      });
    }

    // Summary calculation
    const allPassed = results.every(r => r.passed);
    const policyStatus: 'passed' | 'rejected' = allPassed ? 'passed' : 'rejected';

    return {
      policyStatus,
      results,
      rejectionReasons,
    };
  }
}
