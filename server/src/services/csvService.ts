import { format } from 'fast-csv';
import { Session } from '../models/Session';
import { SessionEvent } from '../models/SessionEvent';
import { ReportDelivery } from '../models/ReportDelivery';
import { Decision } from '../models/Decision';
import { Assessment } from '../models/Assessment';

export class CsvService {
  /**
   * Generate structured CSV export for session events, deliveries, decisions & DRI scores
   */
  static async generateSessionCSV(sessionId: string): Promise<string> {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const events = await SessionEvent.find({ sessionId }).sort({ sequence: 1 });
    const deliveries = await ReportDelivery.find({ sessionId });
    const decisions = await Decision.find({ sessionId }).sort({ exerciseTimeSec: 1 });
    const assessments = await Assessment.find({ sessionId });

    const rows: any[] = [];

    // 1. Session Metadata rows
    rows.push({
      RecordType: 'METADATA',
      Id: session.sessionCode,
      TimestampUTC: session.startedAt?.toISOString() || '',
      SimTimeSec: session.currentSimulatedTimeSec,
      DomainOrRole: 'SYSTEM',
      TitleOrAction: `Scenario: ${session.scenarioId}`,
      StatusOrScore: session.status,
      Details: `Rubric: ${session.scenarioVersion}`,
    });

    // 2. Events & Deliveries
    for (const ev of events) {
      const relatedDeliveries = deliveries.filter((d) => d.eventId === ev.eventId);
      rows.push({
        RecordType: 'EVENT_CREATION',
        Id: ev.eventId,
        TimestampUTC: ev.createdAt.toISOString(),
        SimTimeSec: ev.simulatedTimeSec,
        DomainOrRole: ev.domain.toUpperCase(),
        TitleOrAction: ev.title,
        StatusOrScore: 'CREATED',
        Details: JSON.stringify(ev.payload),
      });

      for (const del of relatedDeliveries) {
        rows.push({
          RecordType: 'REPORT_DELIVERY',
          Id: del.eventId,
          TimestampUTC: del.deliveredAt?.toISOString() || del.scheduledAt.toISOString(),
          SimTimeSec: ev.simulatedTimeSec + (del.delayAppliedSec || 0),
          DomainOrRole: del.recipientRoleId,
          TitleOrAction: del.isConflictingVariant ? '[CONFLICTING_VARIANT]' : '[STANDARD_REPORT]',
          StatusOrScore: del.status.toUpperCase(),
          Details: del.failureReason || `DelayApplied: ${del.delayAppliedSec}s`,
        });
      }
    }

    // 3. Decisions
    for (const dec of decisions) {
      rows.push({
        RecordType: 'DECISION',
        Id: (dec._id as any).toString(),
        TimestampUTC: dec.submittedAt.toISOString(),
        SimTimeSec: dec.exerciseTimeSec,
        DomainOrRole: dec.traineeRoleId,
        TitleOrAction: dec.action,
        StatusOrScore: `Confidence:${dec.confidence}%`,
        Details: `Rationale: ${dec.rationale} | VerifiedEvidence: [${dec.verifiedEvidenceIds.join(';')}] | UnverifiedEvidence: [${dec.unverifiedEvidenceIds.join(';')}]`,
      });
    }

    // 4. Assessments
    for (const ass of assessments) {
      rows.push({
        RecordType: 'ASSESSMENT',
        Id: (ass._id as any).toString(),
        TimestampUTC: ass.createdAt.toISOString(),
        SimTimeSec: session.currentSimulatedTimeSec,
        DomainOrRole: ass.traineeRoleId,
        TitleOrAction: `DRI Total Score: ${ass.totalScore}/100`,
        StatusOrScore: `DRI:${ass.totalScore}`,
        Details: `Timeliness:${ass.metricScores.timeliness}%, Evidence:${ass.metricScores.evidenceUse}%, Calibration:${ass.metricScores.confidenceCalibration}%, Coordination:${ass.metricScores.teamCoordination}%, Objectives:${ass.metricScores.objectiveCompletion}%`,
      });
    }

    return new Promise((resolve, reject) => {
      const csvRows: string[] = [];
      const csvStream = format({ headers: true });

      csvStream.on('data', (chunk) => csvRows.push(chunk.toString()));
      csvStream.on('end', () => resolve(csvRows.join('')));
      csvStream.on('error', reject);

      rows.forEach((r) => csvStream.write(r));
      csvStream.end();
    });
  }
}
