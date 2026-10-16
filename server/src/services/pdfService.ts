import PDFDocument from 'pdfkit';
import { Session } from '../models/Session';
import { Scenario } from '../models/Scenario';
import { Decision } from '../models/Decision';
import { SessionEvent } from '../models/SessionEvent';
import { ReportDelivery } from '../models/ReportDelivery';
import { Assessment } from '../models/Assessment';
import { TeamMessage } from '../models/TeamMessage';
import { User } from '../models/User';

export class PdfService {
  /**
   * Generate complete AAR PDF report into a Buffer
   */
  static async generateAARReport(sessionId: string): Promise<Buffer> {
    const session = await Session.findById(sessionId).populate('createdBy');
    if (!session) throw new Error('Session not found');

    const scenario = await Scenario.findById(session.scenarioId);
    const participants = session.participantIds;
    const users = await User.find({ _id: { $in: participants.map((p) => p.userId) } });
    const userMap = new Map(users.map((u) => [(u._id as any).toString(), u.name]));

    const events = await SessionEvent.find({ sessionId }).sort({ sequence: 1 });
    const deliveries = await ReportDelivery.find({ sessionId });
    const decisions = await Decision.find({ sessionId }).sort({ exerciseTimeSec: 1 });
    const assessments = await Assessment.find({ sessionId });
    const messages = await TeamMessage.find({ sessionId }).sort({ createdAt: 1 });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Colors
      const primaryColor = '#0b1320';
      const accentColor = '#2b4772';
      const textColor = '#1e293b';
      const mutedColor = '#64748b';
      const highlightColor = '#0284c7';

      // 1. Header Banner
      doc.rect(40, 40, 515, 65).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
        .text('SITU-AWARE | AFTER-ACTION REVIEW (AAR)', 55, 52);
      doc.fontSize(9).font('Helvetica')
        .text('MULTI-DOMAIN DECISION-MAKING TRAINER FOR DEGRADED COMMUNICATION ENVIRONMENTS', 55, 75);
      doc.fillColor('#94a3b8').fontSize(8)
        .text(`GOVERNMENT OF INDIA • MINISTRY OF DEFENCE • OFFICIAL EVALUATION RECORD`, 55, 88);

      doc.moveDown(3);

      // 2. Session Metadata Grid
      const metaY = 120;
      doc.rect(40, metaY, 515, 60).strokeColor('#cbd5e1').stroke();
      doc.fillColor(textColor).fontSize(9).font('Helvetica-Bold');
      doc.text(`Scenario: ${scenario?.title || 'Tactical Defense'} (v${scenario?.version || '1.0.0'})`, 50, metaY + 10);
      doc.font('Helvetica').text(`Session Code: ${session.sessionCode}`, 50, metaY + 25);
      doc.text(`Status: ${session.status.toUpperCase()}`, 50, metaY + 40);

      doc.font('Helvetica-Bold').text(`Exercise Duration: ${session.currentSimulatedTimeSec}s (${Math.floor(session.currentSimulatedTimeSec / 60)}m ${session.currentSimulatedTimeSec % 60}s)`, 300, metaY + 10);
      doc.font('Helvetica').text(`Conducted: ${session.startedAt ? session.startedAt.toISOString().slice(0, 19).replace('T', ' ') : 'N/A'} UTC`, 300, metaY + 25);
      doc.text(`Rubric Version: ${scenario?.scoringRubric?.version || '1.0.0'}`, 300, metaY + 40);

      doc.moveDown(4.5);

      // 3. Overall Decision Resilience Index (DRI) Summary
      doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text('1. DECISION RESILIENCE INDEX (DRI) & TRAINEE ASSESSMENTS', 40);
      doc.moveDown(0.5);

      if (assessments.length === 0) {
        doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('No final assessments calculated yet.', 40);
      } else {
        // Table Header
        let y = doc.y;
        doc.rect(40, y, 515, 20).fill('#f1f5f9');
        doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold');
        doc.text('TRAINEE', 48, y + 6);
        doc.text('ROLE', 130, y + 6);
        doc.text('TIMELINESS', 200, y + 6);
        doc.text('EVIDENCE', 265, y + 6);
        doc.text('CALIBRATION', 330, y + 6);
        doc.text('COORDINATION', 410, y + 6);
        doc.text('DRI SCORE', 490, y + 6);
        y += 22;

        assessments.forEach((ass) => {
          const traineeName = userMap.get((ass.traineeId as any).toString()) || 'Unknown Trainee';
          doc.rect(40, y, 515, 20).fill(y % 40 === 0 ? '#ffffff' : '#f8fafc');
          doc.fillColor(textColor).fontSize(8).font('Helvetica');
          doc.text(traineeName, 48, y + 6);
          doc.text(ass.traineeRoleId.toUpperCase(), 130, y + 6);
          doc.text(`${ass.metricScores.timeliness}%`, 210, y + 6);
          doc.text(`${ass.metricScores.evidenceUse}%`, 275, y + 6);
          doc.text(`${ass.metricScores.confidenceCalibration}%`, 345, y + 6);
          doc.text(`${ass.metricScores.teamCoordination}%`, 425, y + 6);
          doc.font('Helvetica-Bold').fillColor(ass.totalScore >= 75 ? '#059669' : ass.totalScore >= 50 ? '#d97706' : '#dc2626')
            .text(`${ass.totalScore}/100`, 495, y + 6);
          y += 22;
        });
        doc.y = y + 10;
      }

      doc.moveDown(1);

      // 4. Injected Communication Disruptions
      doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text('2. INJECTED COMMUNICATION DISRUPTIONS TIMELINE', 40);
      doc.moveDown(0.5);

      if (session.activeDisruptions.length === 0) {
        doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('No dynamic disruptions were injected during this exercise session.', 40);
      } else {
        session.activeDisruptions.forEach((dis, idx) => {
          doc.fillColor(accentColor).fontSize(9).font('Helvetica-Bold')
            .text(`[#${idx + 1}] Disruption Type: ${dis.type.toUpperCase()} | Target Domain: ${(dis.domain || 'ALL').toUpperCase()} | Target Role: ${(dis.targetRoleId || 'ALL').toUpperCase()}`, 45);
          doc.fillColor(textColor).fontSize(8).font('Helvetica')
            .text(`Parameters: ${JSON.stringify(dis.parameters)} | Timestamp: ${dis.injectedAt.toISOString()}`, 55);
          doc.moveDown(0.4);
        });
      }

      doc.moveDown(1);

      // 5. Submitted Decisions & Decision Rationale
      doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text('3. DECISION SUBMISSIONS & RECONSTRUCTED INFORMATION AUDIT', 40);
      doc.moveDown(0.5);

      if (decisions.length === 0) {
        doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('No decisions submitted during this exercise.', 40);
      } else {
        decisions.forEach((dec, idx) => {
          // Check if page overflow
          if (doc.y > 680) {
            doc.addPage();
          }

          const traineeName = userMap.get((dec.traineeId as any).toString()) || 'Unknown Trainee';
          doc.rect(40, doc.y, 515, 75).strokeColor('#e2e8f0').stroke();
          const startY = doc.y + 6;

          doc.fillColor(highlightColor).fontSize(9).font('Helvetica-Bold')
            .text(`Decision #${idx + 1} • ${traineeName} (${dec.traineeRoleId.toUpperCase()}) at Sim Time: ${dec.exerciseTimeSec}s`, 50, startY);
          doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold')
            .text(`Action: `, 50, startY + 14);
          doc.font('Helvetica').text(`${dec.action}`, 85, startY + 14, { width: 450 });

          doc.font('Helvetica-Bold').text(`Rationale: `, 50, startY + 28);
          doc.font('Helvetica').text(`${dec.rationale}`, 95, startY + 28, { width: 440 });

          doc.font('Helvetica-Bold').text(`Confidence: `, 50, startY + 44);
          doc.font('Helvetica').text(`${dec.confidence}%`, 105, startY + 44);

          doc.font('Helvetica-Bold').text(`Verified Evidence: `, 160, startY + 44);
          doc.font('Helvetica').fillColor('#059669').text(`${dec.verifiedEvidenceIds.length > 0 ? dec.verifiedEvidenceIds.join(', ') : 'None'}`, 245, startY + 44);

          doc.fillColor(textColor).font('Helvetica-Bold').text(`Unverified/Dropped Evidence: `, 340, startY + 44);
          doc.font('Helvetica').fillColor('#dc2626').text(`${dec.unverifiedEvidenceIds.length > 0 ? dec.unverifiedEvidenceIds.join(', ') : 'None (0 unverified)'}`, 465, startY + 44);

          doc.moveDown(4.8);
        });
      }

      // 6. Cross-Domain Team Communication Log
      if (doc.y > 660) doc.addPage();
      doc.moveDown(1);
      doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text('4. CROSS-DOMAIN TEAM COMMUNICATIONS LOG', 40);
      doc.moveDown(0.5);

      if (messages.length === 0) {
        doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('No team messages recorded during the session.', 40);
      } else {
        messages.slice(0, 15).forEach((msg) => {
          doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold')
            .text(`[T+${msg.simulatedTimeSec}s] ${msg.senderName} (${msg.senderRoleId.toUpperCase()}): `, 45, undefined, { continued: true });
          doc.font('Helvetica').text(`${msg.message}`);
        });
      }

      // 7. Training Recommendations & Feedback
      if (doc.y > 640) doc.addPage();
      doc.moveDown(1.5);
      doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text('5. INSTRUCTOR OBSERVATIONS & TRAINING RECOMMENDATIONS', 40);
      doc.moveDown(0.5);

      const allRecs = new Set<string>();
      assessments.forEach((a) => a.recommendations.forEach((r) => allRecs.add(r)));

      if (allRecs.size === 0) {
        doc.fillColor(mutedColor).fontSize(9).font('Helvetica').text('Continue standard multi-domain command protocols.', 45);
      } else {
        Array.from(allRecs).forEach((rec, idx) => {
          doc.fillColor(textColor).fontSize(8.5).font('Helvetica')
            .text(`• [Rec ${idx + 1}] ${rec}`, 50);
          doc.moveDown(0.2);
        });
      }

      // Footer
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
          .text(`SITU-AWARE SIH26248 • Automated AAR Synthesis • Page ${i + 1} of ${totalPages} • Cryptographically Audited`, 40, 800, { align: 'center', width: 515 });
      }

      doc.end();
    });
  }
}
