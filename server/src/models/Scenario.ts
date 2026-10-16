import mongoose, { Document, Schema } from 'mongoose';
import { DomainType } from '../types';

export interface IRoleDefinition {
  roleId: string;
  name: string;
  domain: DomainType | 'all';
  description: string;
  permissions: string[];
}

export interface IEventDefinition {
  eventId: string;
  sequence: number;
  title: string;
  domain: DomainType;
  eventType: string; // 'observation' | 'radar_contact' | 'cyber_alert' | 'ew_intercept' | 'comms_degraded'
  payload: {
    text: string;
    source: string;
    confidence: number;
    classification?: string;
    coordinates?: { lat: number; lng: number; label?: string };
    radarTrack?: { trackId: string; heading: number; speed: number; altitude: number; type: string };
    cyberNode?: { systemName: string; status: 'nominal' | 'degraded' | 'offline'; latencyMs: number };
    ewSignal?: { freqMhz: number; signalStrength: number; jammerDetected: boolean; reliability: number };
  };
  intendedRecipients: string[]; // e.g. ['land_lead', 'tactical_intel'] or ['ALL']
  scheduledTimeOffsetSec: number;
  deliveryPolicy: {
    defaultDelaySec?: number;
    allowDropout?: boolean;
    conflictingVariants?: {
      variantId: string;
      recipients: string[];
      alteredPayload: any;
    }[];
  };
}

export interface IScenarioRubric {
  version: string;
  weights: {
    timeliness: number;
    evidenceUse: number;
    confidenceCalibration: number;
    teamCoordination: number;
    objectiveCompletion: number;
  };
  checkpoints: {
    id: string;
    title: string;
    dueTimeSec: number;
    expectedAction: string;
    keyEvidenceEventIds: string[];
    optimalConfidenceRange: [number, number];
  }[];
}

export interface IScenario extends Document {
  title: string;
  description: string;
  version: string;
  domains: DomainType[];
  roleDefinitions: IRoleDefinition[];
  eventDefinitions: IEventDefinition[];
  disruptionConfiguration: {
    presets: {
      id: string;
      name: string;
      type: 'delay' | 'dropout' | 'conflicting';
      parameters: any;
    }[];
  };
  scoringRubric: IScenarioRubric;
  learningObjectives: string[];
  durationMinutes: number;
  createdBy: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ScenarioSchema = new Schema<IScenario>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    version: { type: String, default: '1.0.0' },
    domains: { type: [String], default: ['land', 'air', 'cyber', 'ew'] },
    durationMinutes: { type: Number, default: 20 },
    roleDefinitions: [
      {
        roleId: { type: String, required: true },
        name: { type: String, required: true },
        domain: { type: String, required: true },
        description: { type: String, default: '' },
        permissions: { type: [String], default: [] },
      },
    ],
    eventDefinitions: [
      {
        eventId: { type: String, required: true },
        sequence: { type: Number, required: true },
        title: { type: String, required: true },
        domain: { type: String, enum: ['land', 'air', 'cyber', 'ew'], required: true },
        eventType: { type: String, default: 'observation' },
        payload: { type: Schema.Types.Mixed, required: true },
        intendedRecipients: { type: [String], default: ['ALL'] },
        scheduledTimeOffsetSec: { type: Number, required: true },
        deliveryPolicy: { type: Schema.Types.Mixed, default: {} },
      },
    ],
    disruptionConfiguration: {
      presets: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          type: { type: String, enum: ['delay', 'dropout', 'conflicting'], required: true },
          parameters: { type: Schema.Types.Mixed, default: {} },
        },
      ],
    },
    scoringRubric: {
      version: { type: String, default: '1.0.0' },
      weights: {
        timeliness: { type: Number, default: 0.20 },
        evidenceUse: { type: Number, default: 0.25 },
        confidenceCalibration: { type: Number, default: 0.20 },
        teamCoordination: { type: Number, default: 0.20 },
        objectiveCompletion: { type: Number, default: 0.15 },
      },
      checkpoints: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          dueTimeSec: { type: Number, required: true },
          expectedAction: { type: String, required: true },
          keyEvidenceEventIds: { type: [String], default: [] },
          optimalConfidenceRange: { type: [Number], default: [60, 85] },
        },
      ],
    },
    learningObjectives: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  },
  { timestamps: true }
);

export const Scenario = mongoose.model<IScenario>('Scenario', ScenarioSchema);
