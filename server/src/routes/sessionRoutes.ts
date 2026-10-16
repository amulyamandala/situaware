import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { Session } from '../models/Session';
import { Scenario } from '../models/Scenario';
import { SessionEvent } from '../models/SessionEvent';
import { ReportDelivery } from '../models/ReportDelivery';
import { TeamMessage } from '../models/TeamMessage';
import { EventScheduler } from '../services/eventScheduler';
import { DisruptionEngine } from '../services/disruptionEngine';
import { ResilienceEngine } from '../services/resilienceEngine';

const router = Router();

// GET all sessions
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await Session.find()
      .populate('scenarioId', 'title domains durationMinutes')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ sessions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create session from scenario
router.post('/from-scenario/:scenarioId', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const scenario = await Scenario.findById(req.params.scenarioId);
    if (!scenario) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }

    // Generate readable session code: SITU-XXXX
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const sessionCode = `SITU-${randomDigits}`;

    const session = await Session.create({
      scenarioId: scenario._id,
      scenarioVersion: scenario.version,
      sessionCode,
      status: 'created',
      participantIds: [],
      createdBy: req.user?.userId,
      randomSeed: Math.floor(Math.random() * 1000000),
      currentSimulatedTimeSec: 0,
    });

    res.status(201).json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET single session details
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('scenarioId')
      .populate('createdBy', 'name email');
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST join session with code & role
router.post('/join', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionCode, roleId } = req.body;
    if (!sessionCode) {
      res.status(400).json({ error: 'Session code is required.' });
      return;
    }

    const session = await Session.findOne({ sessionCode: sessionCode.toUpperCase().trim() }).populate('scenarioId');
    if (!session) {
      res.status(404).json({ error: 'Session not found with that code.' });
      return;
    }

    const scenario = session.scenarioId as any;
    const roleDef = scenario.roleDefinitions.find((r: any) => r.roleId === roleId);
    const roleName = roleDef ? roleDef.name : (roleId || 'Tactical Operator');

    // Check if participant already in session
    const userId = req.user?.userId;
    const existingIndex = session.participantIds.findIndex(
      (p) => (p.userId as any).toString() === userId
    );

    if (existingIndex >= 0) {
      session.participantIds[existingIndex].roleId = roleId || session.participantIds[existingIndex].roleId;
      session.participantIds[existingIndex].roleName = roleName;
      session.participantIds[existingIndex].isOnline = true;
    } else {
      session.participantIds.push({
        userId: new mongoose.Types.ObjectId(userId),
        roleId: roleId || scenario.roleDefinitions[0]?.roleId || 'land_lead',
        roleName,
        joinedAt: new Date(),
        isOnline: true,
      });
    }

    await session.save();

    res.json({
      message: 'Joined session successfully',
      session,
      assignedRoleId: roleId || scenario.roleDefinitions[0]?.roleId || 'land_lead',
      assignedRoleName: roleName,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST start session
router.post('/:id/start', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await EventScheduler.startSession(req.params.id as string);
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST pause session
router.post('/:id/pause', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await EventScheduler.pauseSession(req.params.id as string);
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST resume session
router.post('/:id/resume', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await EventScheduler.resumeSession(req.params.id as string);
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST complete session
router.post('/:id/complete', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await EventScheduler.completeSession(req.params.id as string);
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST inject live disruption
router.post('/:id/disruptions', authenticate, requireRole(['instructor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, domain, targetRoleId, parameters = {} } = req.body;
    if (!type || !['delay', 'dropout', 'conflicting'].includes(type)) {
      res.status(400).json({ error: 'Valid disruption type (delay, dropout, conflicting) is required.' });
      return;
    }

    const disruption = await DisruptionEngine.injectDisruption({
      sessionId: req.params.id as string,
      type,
      domain,
      targetRoleId,
      parameters,
      injectedByUserId: req.user!.userId,
    });

    const io = EventScheduler.getSocketServer();
    if (io) {
      io.to(req.params.id).emit('instructor:disruption_applied', disruption);
    }

    res.status(201).json({ disruption });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET role-filtered information feed for current trainee
router.get('/:id/feed', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Determine trainee role
    let roleId = req.query.roleId as string;
    if (!roleId && req.user?.role === 'trainee') {
      const participant = session.participantIds.find(
        (p) => (p.userId as any).toString() === req.user?.userId
      );
      roleId = participant?.roleId || '';
    }

    // Deliveries actually delivered to this role
    const deliveries = await ReportDelivery.find({
      sessionId: session._id,
      recipientRoleId: roleId,
      status: 'delivered',
    })
      .populate('sessionEventId')
      .sort({ deliveredAt: -1 });

    const feed = deliveries.map((d) => {
      const event = d.sessionEventId as any;
      return {
        deliveryId: d._id,
        eventId: d.eventId,
        domain: event?.domain || 'land',
        title: event?.title || 'Tactical Report',
        eventType: event?.eventType || 'observation',
        payload: d.deliveredPayload,
        deliveredAt: d.deliveredAt,
        isConflicting: d.isConflictingVariant,
        wasDelayed: d.delayAppliedSec > 0,
        delaySec: d.delayAppliedSec,
      };
    });

    res.json({ feed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET full session event & delivery timeline (for instructor & AAR replay)
router.get('/:id/timeline', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await SessionEvent.find({ sessionId: req.params.id }).sort({ sequence: 1 });
    const deliveries = await ReportDelivery.find({ sessionId: req.params.id });
    res.json({ events, deliveries });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET reconstructed state at timestamp
router.get('/:id/reconstruct', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId, timestamp } = req.query;
    if (!roleId) {
      res.status(400).json({ error: 'roleId parameter is required' });
      return;
    }

    const atTime = timestamp ? new Date(timestamp as string) : new Date();
    const reconstructed = await ResilienceEngine.reconstructTraineeStateAtTimestamp(
      req.params.id as string,
      roleId as string,
      atTime
    );

    res.json({ reconstructed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Team messages
router.get('/:id/messages', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const messages = await TeamMessage.find({ sessionId: req.params.id }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/messages', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, recipientScope = 'ALL', senderRoleId } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const teamMsg = await TeamMessage.create({
      sessionId: session._id,
      senderId: req.user?.userId,
      senderRoleId: senderRoleId || 'operator',
      senderName: req.user?.name || 'Operator',
      message: message.trim(),
      recipientScope,
      simulatedTimeSec: session.currentSimulatedTimeSec,
    });

    const io = EventScheduler.getSocketServer();
    if (io) {
      io.to(req.params.id).emit('team:message', teamMsg);
    }

    res.status(201).json({ message: teamMsg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
