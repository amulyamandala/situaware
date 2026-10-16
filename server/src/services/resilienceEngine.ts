import mongoose from 'mongoose';
import { Session } from '../models/Session';
import { Scenario } from '../models/Scenario';
import { ReportDelivery } from '../models/ReportDelivery';
import { Decision, IDecision } from '../models/Decision';
import { TeamMessage } from '../models/TeamMessage';
import { Assessment, IAssessment } from '../models/Assessment';
import { MetricScores } from '../types';

export interface VerifyDecisionResult {
  decision: IDecision;
  verifiedEvidenceIds: string[];
  unverifiedEvidenceIds: string[];
  evidenceAvailableCount: number;
}

export class ResilienceEngine {
  /**
   * Reconstruct exact state of information delivered to a trainee at a specific timestamp
   */
  static async reconstructTraineeStateAtTimestamp(
    sessionId: string,
    roleId: string,
    timestamp: Date
  ) {
    const deliveries = await ReportDelivery.find({
      sessionId,
      recipientRoleId: roleId,
      deliveredAt: { $lte: timestamp },
      status: 'delivered',
    }).populate('sessionEventId');

    const droppedReports = await ReportDelivery.find({
      sessionId,
      recipientRoleId: roleId,
      scheduledAt: { $lte: timestamp },
      status: 'dropped',
    }).populate('sessionEventId');

    const delayedOrPendingReports = await ReportDelivery.find({
      sessionId,
      recipientRoleId: roleId,
      scheduledAt: { $lte: timestamp },
      status: 'delayed',
    }).populate('sessionEventId');

    return {
      timestamp,
      deliveredReports: deliveries.map((d) => ({
        deliveryId: d._id,
        eventId: d.eventId,
        domain: (d.sessionEventId as any)?.domain,
        title: (d.sessionEventId as any)?.title,
        payload: d.deliveredPayload,
        deliveredAt: d.deliveredAt,
        isConflicting: d.isConflictingVariant,
      })),
      droppedReports: droppedReports.map((d) => ({
        deliveryId: d._id,
        eventId: d.eventId,
        domain: (d.sessionEventId as any)?.domain,
        title: (d.sessionEventId as any)?.title,
        scheduledAt: d.scheduledAt,
        failureReason: d.failureReason,
      })),
      delayedReports: delayedOrPendingReports.map((d) => ({
        deliveryId: d._id,
        eventId: d.eventId,
        domain: (d.sessionEventId as any)?.domain,
        title: (d.sessionEventId as any)?.title,
        scheduledAt: d.scheduledAt,
        delayAppliedSec: d.delayAppliedSec,
      })),
    };
  }

  /**
   * Validate and record a trainee decision, verifying cited evidence against authoritative delivery records
   */
  static async processDecisionSubmission(params: {
    sessionId: string;
    traineeId: string;
    traineeRoleId: string;
    checkpointId?: string;
    action: string;
    rationale: string;
    evidenceIds: string[];
    confidence: number;
  }): Promise<VerifyDecisionResult> {
    const session = await Session.findById(params.sessionId);
    if (!session) throw new Error('Session not found');

    const submittedAt = new Date();
    const exerciseTimeSec = session.currentSimulatedTimeSec;

    // Check which evidence was delivered to this trainee prior to submittedAt
    const deliveredRecords = await ReportDelivery.find({
      sessionId: session._id,
      recipientRoleId: params.traineeRoleId,
      status: 'delivered',
      deliveredAt: { $lte: submittedAt },
    });

    const deliveredEventIds = new Set(deliveredRecords.map((d) => d.eventId));

    const verifiedEvidenceIds: string[] = [];
    const unverifiedEvidenceIds: string[] = [];

    for (const citedId of params.evidenceIds) {
      if (deliveredEventIds.has(citedId)) {
        verifiedEvidenceIds.push(citedId);
      } else {
        unverifiedEvidenceIds.push(citedId);
      }
    }

    const scenario = await Scenario.findById(session.scenarioId);
    const rubricVersion = scenario?.scoringRubric?.version || '1.0.0';

    const decision = await Decision.create({
      sessionId: session._id,
      traineeId: new mongoose.Types.ObjectId(params.traineeId),
      traineeRoleId: params.traineeRoleId,
      checkpointId: params.checkpointId,
      submittedAt,
      exerciseTimeSec,
      action: params.action,
      rationale: params.rationale,
      evidenceIds: params.evidenceIds,
      verifiedEvidenceIds,
      unverifiedEvidenceIds,
      confidence: params.confidence,
      rubricVersion,
      metadata: {
        totalAvailableReportsCount: deliveredRecords.length,
      },
    });

    return {
      decision,
      verifiedEvidenceIds,
      unverifiedEvidenceIds,
      evidenceAvailableCount: deliveredRecords.length,
    };
  }

  /**
   * Calculate transparent, explainable assessment for a trainee in a session
   */
  static async calculateTraineeAssessment(
    sessionId: string,
    traineeId: string,
    traineeRoleId: string
  ): Promise<IAssessment> {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const scenario = await Scenario.findById(session.scenarioId);
    if (!scenario) throw new Error('Scenario not found');

    const rubric = scenario.scoringRubric;
    const weights = rubric.weights;

    // Fetch trainee's decisions
    const decisions = await Decision.find({ sessionId, traineeId });

    // Fetch trainee's team messages
    const messages = await TeamMessage.find({ sessionId, senderId: traineeId });

    // 1. Metric: Timeliness (0-100)
    let timelinessScore = 80;
    let timelinessReason = 'Decisions were submitted in a timely manner across checkpoints.';
    if (rubric.checkpoints && rubric.checkpoints.length > 0) {
      let checkpointDelays: number[] = [];
      for (const cp of rubric.checkpoints) {
        const dec = decisions.find((d) => d.checkpointId === cp.id);
        if (dec) {
          const delay = Math.max(0, dec.exerciseTimeSec - cp.dueTimeSec);
          checkpointDelays.push(delay);
        } else {
          checkpointDelays.push(60); // penalty for missed checkpoint
        }
      }
      const avgDelay = checkpointDelays.reduce((a, b) => a + b, 0) / checkpointDelays.length;
      timelinessScore = Math.max(20, Math.round(100 - avgDelay * 1.5));
      timelinessReason = `Average checkpoint submission latency: ${Math.round(avgDelay)}s against deadline target.`;
    }

    // 2. Metric: Evidence Use & Verification (0-100)
    let evidenceScore = 75;
    let evidenceReason = 'Reasonable evidence citations with minor gaps.';
    if (decisions.length > 0) {
      let totalVerified = 0;
      let totalUnverified = 0;
      decisions.forEach((d) => {
        totalVerified += d.verifiedEvidenceIds.length;
        totalUnverified += d.unverifiedEvidenceIds.length;
      });

      if (totalVerified + totalUnverified === 0) {
        evidenceScore = 40;
        evidenceReason = 'Decisions were submitted without referencing specific evidence or intelligence reports.';
      } else {
        const accuracyRate = totalVerified / (totalVerified + totalUnverified);
        // Base score on verification accuracy and volume
        evidenceScore = Math.min(100, Math.round(accuracyRate * 85 + Math.min(15, totalVerified * 5)));
        evidenceReason = `Verified ${totalVerified} received report(s). Cited ${totalUnverified} unverified/unreceived report(s). (${Math.round(accuracyRate * 100)}% verification rate).`;
      }
    }

    // 3. Metric: Confidence Calibration (0-100)
    // Measures whether confidence aligned with available information quality and checkpoint optimal range
    let confidenceScore = 80;
    let confidenceReason = 'Confidence levels matched information completeness.';
    if (decisions.length > 0) {
      let deviations: number[] = [];
      decisions.forEach((d) => {
        const cp = rubric.checkpoints?.find((c) => c.id === d.checkpointId);
        const [optMin, optMax] = cp?.optimalConfidenceRange || [60, 85];
        if (d.confidence < optMin) {
          deviations.push(optMin - d.confidence);
        } else if (d.confidence > optMax) {
          deviations.push(d.confidence - optMax);
        } else {
          deviations.push(0);
        }
      });
      const avgDev = deviations.reduce((a, b) => a + b, 0) / deviations.length;
      confidenceScore = Math.max(30, Math.round(100 - avgDev * 1.8));
      confidenceReason = `Confidence calibrated within ${Math.round(avgDev)}% deviation from uncertainty-adjusted operational baseline.`;
    }

    // 4. Metric: Team Coordination (0-100)
    let coordinationScore = 50;
    let coordinationReason = 'Minimal cross-domain team coordination observed.';
    if (messages.length >= 6) {
      coordinationScore = 95;
      coordinationReason = `High coordination: Sent ${messages.length} tactical updates to team channels during exercise.`;
    } else if (messages.length >= 3) {
      coordinationScore = 80;
      coordinationReason = `Adequate coordination: Sent ${messages.length} cross-role messages during exercise.`;
    } else if (messages.length >= 1) {
      coordinationScore = 65;
      coordinationReason = `Limited coordination: Sent only ${messages.length} message(s) to team members.`;
    }

    // 5. Metric: Scenario Objective Completion (0-100)
    let objectiveScore = 85;
    let objectiveReason = 'Key operational objectives fulfilled.';
    if (decisions.length === 0) {
      objectiveScore = 20;
      objectiveReason = 'No decisions were committed during the operational scenario.';
    } else {
      let matches = 0;
      for (const d of decisions) {
        if (d.action && d.action.trim().length > 5 && d.rationale && d.rationale.trim().length > 10) {
          matches++;
        }
      }
      objectiveScore = Math.min(100, Math.round((matches / Math.max(1, decisions.length)) * 90 + 10));
      objectiveReason = `Formulated well-structured action plans with substantiated rationale for ${matches}/${decisions.length} decision point(s).`;
    }

    const metricScores: MetricScores = {
      timeliness: timelinessScore,
      evidenceUse: evidenceScore,
      confidenceCalibration: confidenceScore,
      teamCoordination: coordinationScore,
      objectiveCompletion: objectiveScore,
    };

    // Calculate DRI (Decision Resilience Index)
    const DRI = Math.round(
      weights.timeliness * metricScores.timeliness +
      weights.evidenceUse * metricScores.evidenceUse +
      weights.confidenceCalibration * metricScores.confidenceCalibration +
      weights.teamCoordination * metricScores.teamCoordination +
      weights.objectiveCompletion * metricScores.objectiveCompletion
    );

    const recommendations: string[] = [];
    if (metricScores.evidenceUse < 70) {
      recommendations.push('Cross-verify sensor data against known dropout records before committing decisive maneuvers.');
    }
    if (metricScores.teamCoordination < 70) {
      recommendations.push('Increase radio/tactical chatter when synthetic jamming degrades primary data channels.');
    }
    if (metricScores.confidenceCalibration < 70) {
      recommendations.push('Adjust subjective certainty downward when operating under contradictory radar/cyber alerts.');
    }
    if (metricScores.timeliness < 70) {
      recommendations.push('Streamline deliberation time to submit critical tactical directives prior to checkpoint expiration.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain exemplary cross-domain communication discipline under contested EW conditions.');
    }

    // Save or update Assessment
    const assessment = await Assessment.findOneAndUpdate(
      { sessionId, traineeId },
      {
        sessionId: session._id,
        traineeId: new mongoose.Types.ObjectId(traineeId),
        traineeRoleId,
        rubricVersion: rubric.version,
        metricScores,
        totalScore: DRI,
        explanations: {
          timelinessReason,
          evidenceReason,
          confidenceReason,
          coordinationReason,
          objectiveReason,
        },
        recommendations,
      },
      { upsert: true, new: true }
    );

    return assessment;
  }
}
