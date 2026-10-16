import mongoose, { Document, Schema } from 'mongoose';
import { DomainType } from '../types';

export interface ISessionEvent extends Document {
  sessionId: mongoose.Types.ObjectId;
  sequence: number;
  eventId: string;
  eventType: string;
  domain: DomainType;
  title: string;
  createdAt: Date;
  scheduledAt: Date;
  simulatedTimeSec: number;
  payload: any;
  intendedRecipients: string[];
  deliveryPolicy: any;
  metadata?: any;
}

const SessionEventSchema = new Schema<ISessionEvent>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    sequence: { type: Number, required: true },
    eventId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    domain: { type: String, enum: ['land', 'air', 'cyber', 'ew'], required: true, index: true },
    title: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    scheduledAt: { type: Date, required: true },
    simulatedTimeSec: { type: Number, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    intendedRecipients: { type: [String], default: ['ALL'] },
    deliveryPolicy: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

SessionEventSchema.index({ sessionId: 1, sequence: 1 }, { unique: true });

export const SessionEvent = mongoose.model<ISessionEvent>('SessionEvent', SessionEventSchema);
