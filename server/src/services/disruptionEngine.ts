import mongoose from 'mongoose';
import { Session, IActiveDisruption } from '../models/Session';
import { DisruptionType } from '../types';

export interface InjectDisruptionParams {
  sessionId: string;
  type: DisruptionType;
  domain?: string;
  targetRoleId?: string;
  parameters: {
    delaySec?: number;
    dropPercentage?: number;
    conflictDescription?: string;
    overridePayload?: any;
    targetEventId?: string;
  };
  injectedByUserId: string;
}

export class DisruptionEngine {
  /**
   * Inject a live disruption into an active session
   */
  static async injectDisruption(params: InjectDisruptionParams): Promise<IActiveDisruption> {
    const session = await Session.findById(params.sessionId);
    if (!session) {
      throw new Error(`Session ${params.sessionId} not found.`);
    }

    if (session.status !== 'active') {
      throw new Error(`Cannot inject disruption into session with status '${session.status}'. Must be 'active'.`);
    }

    const disruption: IActiveDisruption = {
      id: `DISRUPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: params.type,
      domain: params.domain,
      targetRoleId: params.targetRoleId,
      parameters: params.parameters,
      injectedAt: new Date(),
      injectedBy: new mongoose.Types.ObjectId(params.injectedByUserId),
    };

    session.activeDisruptions.push(disruption);
    await session.save();

    console.log(`[DisruptionEngine] Injected ${disruption.type} into session ${session.sessionCode} for domain: ${disruption.domain || 'ALL'}, targetRole: ${disruption.targetRoleId || 'ALL'}`);

    return disruption;
  }

  /**
   * Determine effective delivery for an event given active disruptions and delivery policy
   */
  static evaluateDelivery(
    eventDef: any,
    recipientRoleId: string,
    activeDisruptions: IActiveDisruption[],
    currentSimTimeSec: number
  ): {
    status: 'delivered' | 'dropped' | 'delayed';
    scheduledDelaySec: number;
    isConflicting: boolean;
    payload: any;
    failureReason?: string;
  } {
    let status: 'delivered' | 'dropped' | 'delayed' = 'delivered';
    let scheduledDelaySec = eventDef.deliveryPolicy?.defaultDelaySec || 0;
    let isConflicting = false;
    let payload = JSON.parse(JSON.stringify(eventDef.payload));
    let failureReason: string | undefined = undefined;

    // Check for predefined conflicting variant in scenario event definition
    if (eventDef.deliveryPolicy?.conflictingVariants && eventDef.deliveryPolicy.conflictingVariants.length > 0) {
      for (const variant of eventDef.deliveryPolicy.conflictingVariants) {
        if (variant.recipients.includes(recipientRoleId) || variant.recipients.includes('ALL')) {
          payload = { ...payload, ...variant.alteredPayload };
          isConflicting = true;
          break;
        }
      }
    }

    // Check active live disruptions matching domain or role
    for (const disruption of activeDisruptions) {
      const domainMatches = !disruption.domain || disruption.domain === 'all' || disruption.domain === eventDef.domain;
      const roleMatches = !disruption.targetRoleId || disruption.targetRoleId === 'all' || disruption.targetRoleId === recipientRoleId;
      const eventMatches = !disruption.parameters.targetEventId || disruption.parameters.targetEventId === eventDef.eventId;

      if (domainMatches && roleMatches && eventMatches) {
        if (disruption.type === 'dropout') {
          // Drop report
          status = 'dropped';
          failureReason = `Report dropped due to active EW/Cyber disruption: ${disruption.id} (target: ${recipientRoleId})`;
          break;
        } else if (disruption.type === 'delay') {
          status = 'delayed';
          scheduledDelaySec += disruption.parameters.delaySec || 15;
        } else if (disruption.type === 'conflicting') {
          isConflicting = true;
          if (disruption.parameters.overridePayload) {
            payload = {
              ...payload,
              ...disruption.parameters.overridePayload,
              confidence: disruption.parameters.overridePayload.confidence || Math.max(30, payload.confidence - 25),
              source: `${payload.source} [Alternate Channel]`,
            };
          } else {
            // Apply generic conflicting mutation based on domain
            payload = this.generateConflictingPayload(eventDef.domain, payload);
          }
        }
      }
    }

    if (scheduledDelaySec > 0 && status === 'delivered') {
      status = 'delayed';
    }

    return {
      status,
      scheduledDelaySec,
      isConflicting,
      payload,
      failureReason,
    };
  }

  private static generateConflictingPayload(domain: string, originalPayload: any): any {
    const mutated = { ...originalPayload };
    if (domain === 'land') {
      mutated.text = `[CONTRADICTORY INTEL] Recon patrol reports route is SEVERELY BLOCKED by enemy barrier obstacles, contrary to earlier satellite imagery.`;
      mutated.confidence = 65;
    } else if (domain === 'air') {
      mutated.text = `[RADAR DISCREPANCY] Contact track altitude fluctuating rapidly. IFF interrogator returning UNKNOWN response, not friendly squawk.`;
      mutated.confidence = 55;
    } else if (domain === 'cyber') {
      mutated.text = `[ALERT CONFLICT] Tactical edge server reports heartbeat NORMAL, but secondary monitor flags intermittent packet loss & authentication failures.`;
      mutated.confidence = 60;
    } else if (domain === 'ew') {
      mutated.text = `[RF ANOMALY] Spectrum analyzer detects broadband barrage jamming on battalion command net. Comms degraded by 80%.`;
      mutated.confidence = 85;
    }
    return mutated;
  }
}
