import mongoose, { Document, Schema } from 'mongoose';
import { SessionStatus, DisruptionType } from '../types';

export interface ISessionParticipant {
  userId: mongoose.Types.ObjectId;
  roleId: string;
  roleName: string;
  joinedAt: Date;
  isOnline: boolean;
  socketId?: string;
}

export interface IActiveDisruption {
  id: string;
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
  injectedAt: Date;
  injectedBy: mongoose.Types.ObjectId;
}

export interface ISession extends Document {
  scenarioId: mongoose.Types.ObjectId;
  scenarioVersion: string;
  sessionCode: string;
  status: SessionStatus;
  participantIds: ISessionParticipant[];
  startedAt?: Date;
  pausedAt?: Date;
  totalPausedDurationMs: number;
  endedAt?: Date;
  randomSeed: number;
  createdBy: mongoose.Types.ObjectId;
  activeDisruptions: IActiveDisruption[];
  currentSimulatedTimeSec: number;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
    scenarioVersion: { type: String, default: '1.0.0' },
    sessionCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    status: { type: String, enum: ['created', 'active', 'paused', 'completed'], default: 'created' },
    participantIds: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        roleId: { type: String, required: true },
        roleName: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
        isOnline: { type: Boolean, default: false },
        socketId: { type: String },
      },
    ],
    startedAt: { type: Date },
    pausedAt: { type: Date },
    totalPausedDurationMs: { type: Number, default: 0 },
    endedAt: { type: Date },
    randomSeed: { type: Number, default: () => Math.floor(Math.random() * 1000000) },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activeDisruptions: [
      {
        id: { type: String, required: true },
        type: { type: String, enum: ['delay', 'dropout', 'conflicting'], required: true },
        domain: { type: String },
        targetRoleId: { type: String },
        parameters: { type: Schema.Types.Mixed, default: {} },
        injectedAt: { type: Date, default: Date.now },
        injectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    currentSimulatedTimeSec: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Session = mongoose.model<ISession>('Session', SessionSchema);
