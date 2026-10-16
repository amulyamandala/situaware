import { Server } from 'socket.io';
import { Session, ISession } from '../models/Session';
import { Scenario, IScenario } from '../models/Scenario';
import { SessionEvent } from '../models/SessionEvent';
import { ReportDelivery } from '../models/ReportDelivery';
import { DisruptionEngine } from './disruptionEngine';

interface ActiveSessionTimer {
  interval: NodeJS.Timeout;
  sessionId: string;
}

export class EventScheduler {
  private static io: Server | null = null;
  private static timers: Map<string, ActiveSessionTimer> = new Map();
  // Store delayed deliveries pending arrival: { sessionId, deliveryId, deliverAtSimSec }
  private static pendingDelayedDeliveries: Map<string, { deliveryId: string; deliverAtSimSec: number }[]> = new Map();

  static setSocketServer(io: Server) {
    this.io = io;
  }

  static getSocketServer(): Server | null {
    return this.io;
  }

  /**
   * Start a session's authoritative timer and event loop
   */
  static async startSession(sessionId: string): Promise<ISession> {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.status === 'active') return session;

    session.status = 'active';
    if (!session.startedAt) {
      session.startedAt = new Date();
      session.currentSimulatedTimeSec = 0;
    } else if (session.pausedAt) {
      // Resume from paused
      const pauseDuration = Date.now() - session.pausedAt.getTime();
      session.totalPausedDurationMs += pauseDuration;
      session.pausedAt = undefined;
    }
    await session.save();

    this.startSessionTimer(sessionId);

    if (this.io) {
      this.io.to(sessionId).emit('session:started', {
        sessionId,
        status: session.status,
        simulatedTimeSec: session.currentSimulatedTimeSec,
        startedAt: session.startedAt,
      });
    }

    console.log(`[EventScheduler] Session ${session.sessionCode} (${sessionId}) STARTED at sim time ${session.currentSimulatedTimeSec}s`);
    return session;
  }

  /**
   * Pause a session
   */
  static async pauseSession(sessionId: string): Promise<ISession> {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.status !== 'active') return session;

    session.status = 'paused';
    session.pausedAt = new Date();
    await session.save();

    this.stopSessionTimer(sessionId);

    if (this.io) {
      this.io.to(sessionId).emit('session:paused', {
        sessionId,
        status: session.status,
        simulatedTimeSec: session.currentSimulatedTimeSec,
      });
    }

    console.log(`[EventScheduler] Session ${session.sessionCode} PAUSED at sim time ${session.currentSimulatedTimeSec}s`);
    return session;
  }

  /**
   * Resume a session
   */
  static async resumeSession(sessionId: string): Promise<ISession> {
    return this.startSession(sessionId);
  }

  /**
   * Complete a session
   */
  static async completeSession(sessionId: string): Promise<ISession> {
    const session = await Session.findById(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'completed';
    session.endedAt = new Date();
    await session.save();

    this.stopSessionTimer(sessionId);

    if (this.io) {
      this.io.to(sessionId).emit('session:completed', {
        sessionId,
        status: session.status,
        endedAt: session.endedAt,
      });
    }

    console.log(`[EventScheduler] Session ${session.sessionCode} COMPLETED.`);
    return session;
  }

  static stopAllTimers() {
    for (const [sessionId, timer] of this.timers.entries()) {
      clearInterval(timer.interval);
    }
    this.timers.clear();
    this.pendingDelayedDeliveries.clear();
  }

  private static startSessionTimer(sessionId: string) {
    if (this.timers.has(sessionId)) {
      clearInterval(this.timers.get(sessionId)!.interval);
    }

    const interval = setInterval(async () => {
      try {
        await this.tickSession(sessionId);
      } catch (err) {
        console.error(`[EventScheduler] Error during tick for session ${sessionId}:`, err);
      }
    }, 1000); // 1 real second = 1 sim second

    this.timers.set(sessionId, { interval, sessionId });
  }

  private static stopSessionTimer(sessionId: string) {
    if (this.timers.has(sessionId)) {
      clearInterval(this.timers.get(sessionId)!.interval);
      this.timers.delete(sessionId);
    }
  }

  /**
   * Advance 1 second and process scheduled events & delayed deliveries
   */
  private static async tickSession(sessionId: string) {
    const session = await Session.findById(sessionId);
    if (!session || session.status !== 'active') {
      this.stopSessionTimer(sessionId);
      return;
    }

    session.currentSimulatedTimeSec += 1;
    const currentSimSec = session.currentSimulatedTimeSec;
    await session.save();

    // Broadcast time sync every second
    if (this.io) {
      this.io.to(sessionId).emit('session:time', {
        sessionId,
        simulatedTimeSec: currentSimSec,
      });
    }

    // Check if any delayed deliveries reached their scheduled delivery time
    await this.processDelayedDeliveries(sessionId, currentSimSec);

    // Fetch scenario event definitions scheduled for this exact second
    const scenario = await Scenario.findById(session.scenarioId);
    if (!scenario) return;

    // Check if exercise time reached duration limit
    if (currentSimSec >= scenario.durationMinutes * 60) {
      console.log(`[EventScheduler] Exercise time limit reached (${scenario.durationMinutes} min). Auto-completing session.`);
      await this.completeSession(sessionId);
      return;
    }

    const scheduledEvents = scenario.eventDefinitions.filter(
      (ev) => ev.scheduledTimeOffsetSec === currentSimSec
    );

    if (scheduledEvents.length === 0) return;

    // Determine current sequence number for session
    const lastEvent = await SessionEvent.findOne({ sessionId }).sort({ sequence: -1 });
    let nextSeq = (lastEvent?.sequence || 0) + 1;

    for (const eventDef of scheduledEvents) {
      // 1. Persist SessionEvent
      const sessionEvent = await SessionEvent.create({
        sessionId: session._id,
        sequence: nextSeq++,
        eventId: eventDef.eventId,
        eventType: eventDef.eventType,
        domain: eventDef.domain,
        title: eventDef.title,
        createdAt: new Date(),
        scheduledAt: new Date(),
        simulatedTimeSec: currentSimSec,
        payload: eventDef.payload,
        intendedRecipients: eventDef.intendedRecipients,
        deliveryPolicy: eventDef.deliveryPolicy,
        metadata: { scenarioVersion: scenario.version },
      });

      // 2. Determine recipients
      // Scenario roles: e.g. ['land_lead', 'air_controller', 'cyber_specialist', 'ew_officer']
      const targetRoles: string[] = [];
      if (eventDef.intendedRecipients.includes('ALL')) {
        scenario.roleDefinitions.forEach((r) => targetRoles.push(r.roleId));
      } else {
        targetRoles.push(...eventDef.intendedRecipients);
      }

      // 3. For each recipient, evaluate delivery & apply active disruptions
      for (const roleId of targetRoles) {
        const deliveryResult = DisruptionEngine.evaluateDelivery(
          eventDef,
          roleId,
          session.activeDisruptions,
          currentSimSec
        );

        const scheduledDeliveryTime = new Date(Date.now() + deliveryResult.scheduledDelaySec * 1000);

        const reportDelivery = await ReportDelivery.create({
          sessionId: session._id,
          eventId: eventDef.eventId,
          sessionEventId: sessionEvent._id,
          recipientRoleId: roleId,
          status: deliveryResult.status,
          scheduledAt: scheduledDeliveryTime,
          deliveredAt: deliveryResult.status === 'delivered' ? new Date() : undefined,
          delayAppliedSec: deliveryResult.scheduledDelaySec,
          isConflictingVariant: deliveryResult.isConflicting,
          deliveredPayload: deliveryResult.payload,
          failureReason: deliveryResult.failureReason,
        });

        // If delivered immediately, emit to recipient role room
        if (deliveryResult.status === 'delivered') {
          if (this.io) {
            // Emitted to role room: `${sessionId}:role:${roleId}`
            this.io.to(`${sessionId}:role:${roleId}`).emit('feed:report', {
              deliveryId: reportDelivery._id,
              eventId: eventDef.eventId,
              domain: eventDef.domain,
              title: eventDef.title,
              eventType: eventDef.eventType,
              payload: deliveryResult.payload,
              deliveredAt: reportDelivery.deliveredAt,
              simulatedTimeSec: currentSimSec,
              isConflicting: deliveryResult.isConflicting,
            });
          }
        } else if (deliveryResult.status === 'delayed') {
          // Schedule for future delivery
          const deliverAtSim = currentSimSec + deliveryResult.scheduledDelaySec;
          const pending = this.pendingDelayedDeliveries.get(sessionId) || [];
          pending.push({ deliveryId: (reportDelivery._id as any).toString(), deliverAtSimSec: deliverAtSim });
          this.pendingDelayedDeliveries.set(sessionId, pending);
          console.log(`[EventScheduler] Event ${eventDef.eventId} delayed for ${roleId} by ${deliveryResult.scheduledDelaySec}s (deliver at sim ${deliverAtSim}s)`);
        } else if (deliveryResult.status === 'dropped') {
          console.log(`[EventScheduler] Event ${eventDef.eventId} DROPPED for ${roleId}. (Reason: ${deliveryResult.failureReason})`);
        }

        // Notify instructor console of full audit event (unfiltered)
        if (this.io) {
          this.io.to(`${sessionId}:instructor`).emit('instructor:event_dispatched', {
            sessionEventId: sessionEvent._id,
            eventId: eventDef.eventId,
            sequence: sessionEvent.sequence,
            domain: eventDef.domain,
            title: eventDef.title,
            recipientRoleId: roleId,
            deliveryStatus: deliveryResult.status,
            delaySec: deliveryResult.scheduledDelaySec,
            isConflicting: deliveryResult.isConflicting,
            failureReason: deliveryResult.failureReason,
            simulatedTimeSec: currentSimSec,
          });
        }
      }
    }
  }

  /**
   * Check and deliver delayed reports that have arrived
   */
  private static async processDelayedDeliveries(sessionId: string, currentSimSec: number) {
    const pending = this.pendingDelayedDeliveries.get(sessionId);
    if (!pending || pending.length === 0) return;

    const remaining: { deliveryId: string; deliverAtSimSec: number }[] = [];

    for (const item of pending) {
      if (currentSimSec >= item.deliverAtSimSec) {
        const delivery = await ReportDelivery.findById(item.deliveryId).populate('sessionEventId');
        if (delivery && delivery.status === 'delayed') {
          delivery.status = 'delivered';
          delivery.deliveredAt = new Date();
          await delivery.save();

          const event = delivery.sessionEventId as any;

          if (this.io) {
            this.io.to(`${sessionId}:role:${delivery.recipientRoleId}`).emit('feed:report', {
              deliveryId: delivery._id,
              eventId: delivery.eventId,
              domain: event.domain,
              title: event.title,
              eventType: event.eventType,
              payload: delivery.deliveredPayload,
              deliveredAt: delivery.deliveredAt,
              simulatedTimeSec: currentSimSec,
              isConflicting: delivery.isConflictingVariant,
              wasDelayed: true,
              delaySec: delivery.delayAppliedSec,
            });

            this.io.to(`${sessionId}:instructor`).emit('instructor:delayed_report_delivered', {
              deliveryId: delivery._id,
              eventId: delivery.eventId,
              recipientRoleId: delivery.recipientRoleId,
              simulatedTimeSec: currentSimSec,
            });
          }
          console.log(`[EventScheduler] Delayed event ${delivery.eventId} now delivered to ${delivery.recipientRoleId} at sim ${currentSimSec}s`);
        }
      } else {
        remaining.push(item);
      }
    }

    this.pendingDelayedDeliveries.set(sessionId, remaining);
  }
}
