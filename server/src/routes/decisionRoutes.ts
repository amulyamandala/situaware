import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Session } from '../models/Session';
import { Decision } from '../models/Decision';
import { Assessment } from '../models/Assessment';
import { ResilienceEngine } from '../services/resilienceEngine';
import { EventScheduler } from '../services/eventScheduler';

const router = Router();

// POST submit decision
router.post('/:sessionId/decisions', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.sessionId as string;
    const { action, rationale, evidenceIds = [], confidence, checkpointId, traineeRoleId } = req.body;

    if (!action || !rationale || confidence === undefined) {
      res.status(400).json({ error: 'Action, written rationale, and confidence rating (0-100) are required.' });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Determine trainee role
    let roleId = traineeRoleId;
    if (!roleId) {
      const participant = session.participantIds.find(
        (p) => (p.userId as any).toString() === req.user?.userId
      );
      roleId = participant?.roleId || 'operator';
    }

    const result = await ResilienceEngine.processDecisionSubmission({
      sessionId,
      traineeId: req.user!.userId,
      traineeRoleId: roleId,
      checkpointId,
      action,
      rationale,
      evidenceIds,
      confidence: Number(confidence),
    });

    const io = EventScheduler.getSocketServer();
    if (io) {
      // Notify instructor room of decision submitted with verification tags
      io.to(`${sessionId}:instructor`).emit('decision:submitted', {
        decision: result.decision,
        verifiedEvidenceIds: result.verifiedEvidenceIds,
        unverifiedEvidenceIds: result.unverifiedEvidenceIds,
        traineeName: req.user?.name,
      });

      // Acknowledge back to trainee socket
      io.to(`${sessionId}:role:${roleId}`).emit('decision:acknowledged', {
        decisionId: result.decision._id,
        exerciseTimeSec: result.decision.exerciseTimeSec,
        verifiedEvidenceCount: result.verifiedEvidenceIds.length,
      });
    }

    res.status(201).json({
      message: 'Decision submitted and evaluated against authoritative delivery history.',
      decision: result.decision,
      audit: {
        verifiedEvidence: result.verifiedEvidenceIds,
        unverifiedEvidence: result.unverifiedEvidenceIds,
        evidenceAvailableCount: result.evidenceAvailableCount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET decisions for a session
router.get('/:sessionId/decisions', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = { sessionId: req.params.sessionId };
    // If trainee, only return their decisions unless instructor/admin
    if (req.user?.role === 'trainee') {
      query.traineeId = req.user.userId;
    }

    const decisions = await Decision.find(query).populate('traineeId', 'name email').sort({ exerciseTimeSec: 1 });
    res.json({ decisions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET assessments for a session
router.get('/:sessionId/assessments', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = { sessionId: req.params.sessionId };
    if (req.user?.role === 'trainee') {
      query.traineeId = req.user.userId;
    }

    const assessments = await Assessment.find(query).populate('traineeId', 'name email');
    res.json({ assessments });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST compute assessments for all participants
router.post('/:sessionId/assessments/compute', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const calculated: any[] = [];
    for (const participant of session.participantIds) {
      const assessment = await ResilienceEngine.calculateTraineeAssessment(
        (session._id as any).toString(),
        (participant.userId as any).toString(),
        participant.roleId
      );
      calculated.push(assessment);
    }

    const io = EventScheduler.getSocketServer();
    if (io) {
      io.to(req.params.sessionId).emit('aar:ready', {
        sessionId: session._id,
        assessmentCount: calculated.length,
      });
    }

    res.json({
      message: `Calculated ${calculated.length} transparent Decision Resilience assessments.`,
      assessments: calculated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH instructor feedback on assessment
router.patch('/:sessionId/assessments/:assessmentId/feedback', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { instructorFeedback, recommendations } = req.body;
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.assessmentId,
      {
        ...(instructorFeedback !== undefined && { instructorFeedback }),
        ...(recommendations !== undefined && { recommendations }),
      },
      { new: true }
    );

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    res.json({ assessment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
