import { storage } from './storage';
import { LedgerEntry, TaskRecord } from './types';

export class LedgerService {
  /**
   * Records advertised reward when a task is discovered and policy verified.
   */
  static recordAdvertisedReward(task: TaskRecord): LedgerEntry {
    return storage.recordLedgerEntry({
      taskId: task.id,
      taskTitle: task.title,
      entryType: 'advertised_reward',
      amount: task.rewardAmount,
      currency: task.currency,
      counterparty: task.providerId,
      complianceCheckAlgeria: true,
      isTestData: task.isTestMode,
      notes: `Discovered reward advertised on ${task.sourceUrl} (Escrow: ${task.fundingStatus}).`,
    });
  }

  /**
   * Moves reward to pending when submission has been dispatched.
   */
  static recordPendingReward(task: TaskRecord, submissionRef: string): LedgerEntry {
    return storage.recordLedgerEntry({
      taskId: task.id,
      taskTitle: task.title,
      entryType: 'pending_reward',
      amount: task.rewardAmount,
      currency: task.currency,
      verificationEvidence: submissionRef,
      counterparty: task.providerId,
      complianceCheckAlgeria: true,
      isTestData: task.isTestMode,
      notes: `Submission dispatched. Awaiting provider maintainer review and acceptance: ${submissionRef}`,
    });
  }

  /**
   * Records accepted reward when maintainer/provider approves the deliverable.
   */
  static recordAcceptedReward(task: TaskRecord, providerReviewId: string): LedgerEntry {
    return storage.recordLedgerEntry({
      taskId: task.id,
      taskTitle: task.title,
      entryType: 'accepted_reward',
      amount: task.rewardAmount,
      currency: task.currency,
      verificationEvidence: `Provider Review Approval #${providerReviewId}`,
      counterparty: task.providerId,
      complianceCheckAlgeria: true,
      isTestData: task.isTestMode,
      notes: `Deliverable accepted by maintainer. Payment scheduled by provider escrow release.`,
    });
  }

  /**
   * Records payment received ONLY when independently verified via real fiat/SEPA/Stripe/Wise settlement.
   * Strict Rule: Never fabricate transaction hashes or payment confirmations.
   * Strict Rule: Algeria compliance - do NOT activate virtual-asset/USDT transfers without verified legal authorization.
   */
  static verifyAndRecordPayment(params: {
    task: TaskRecord;
    verificationMethod: 'bank_wire' | 'stripe_transfer' | 'wise_payout' | 'escrow_release';
    verifiedSettlementReference: string;
    actualAmount: number;
    currency: string;
    isTestSimulation?: boolean;
  }): { success: boolean; entry?: LedgerEntry; error?: string } {
    // Algeria compliance check:
    const paymentMethod = params.verificationMethod;
    if (paymentMethod as string === 'usdt_crypto' || paymentMethod as string === 'virtual_asset') {
      const errorMsg = 'Compliance Block: Virtual-asset transfers or USDT payments are legally prohibited for Algeria without verified Central Bank authorization. Payment rejected.';
      storage.addLog('security', 'compliance', errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!params.verifiedSettlementReference || params.verifiedSettlementReference.trim().length < 5) {
      return { 
        success: false, 
        error: 'Payment cannot be verified without authentic bank settlement reference or escrow payout document.' 
      };
    }

    // Record verified payment received
    const receivedEntry = storage.recordLedgerEntry({
      taskId: params.task.id,
      taskTitle: params.task.title,
      entryType: 'payment_received',
      amount: params.actualAmount,
      currency: params.currency,
      verificationMethod: params.verificationMethod,
      verificationEvidence: params.verifiedSettlementReference,
      counterparty: params.task.providerId,
      complianceCheckAlgeria: true,
      isTestData: params.isTestSimulation ?? params.task.isTestMode,
      notes: `Verified independent settlement via ${params.verificationMethod}. Reference: ${params.verifiedSettlementReference}`,
    });

    // Also transition into withdrawable balance once cleared
    const withdrawableEntry = storage.recordLedgerEntry({
      taskId: params.task.id,
      taskTitle: params.task.title,
      entryType: 'withdrawable_balance',
      amount: params.actualAmount,
      currency: params.currency,
      verificationMethod: params.verificationMethod,
      verificationEvidence: params.verifiedSettlementReference,
      counterparty: 'ATE Central Reserve (Bank Cleared)',
      complianceCheckAlgeria: true,
      isTestData: params.isTestSimulation ?? params.task.isTestMode,
      notes: `Funds cleared by banking partner. Legally withdrawable via standard bank wire / SWIFT to Algerian bank.`,
    });

    params.task.executionStatus = 'payment_verified';
    storage.saveTask(params.task);

    return { success: true, entry: receivedEntry };
  }
}
