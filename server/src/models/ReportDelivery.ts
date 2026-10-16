import mongoose, { Document, Schema } from 'mongoose';
import { DeliveryStatus } from '../types';

export interface IReportDelivery extends Document {
  sessionId: mongoose.Types.ObjectId;
  eventId: string;
  sessionEventId: mongoose.Types.ObjectId;
  recipientRoleId: string;
  recipientUserId?: mongoose.Types.ObjectId;
  status: DeliveryStatus;
  scheduledAt: Date;
  deliveredAt?: Date;
  delayAppliedSec: number;
  isConflictingVariant: boolean;
  deliveredPayload: any;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportDeliverySchema = new Schema<IReportDelivery>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    eventId: { type: String, required: true, index: true },
    sessionEventId: { type: Schema.Types.ObjectId, ref: 'SessionEvent', required: true },
    recipientRoleId: { type: String, required: true, index: true },
    recipientUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['scheduled', 'delivered', 'dropped', 'delayed'],
      default: 'scheduled',
      index: true,
    },
    scheduledAt: { type: Date, required: true },
    deliveredAt: { type: Date },
    delayAppliedSec: { type: Number, default: 0 },
    isConflictingVariant: { type: Boolean, default: false },
    deliveredPayload: { type: Schema.Types.Mixed, required: true },
    failureReason: { type: String },
  },
  { timestamps: true }
);

ReportDeliverySchema.index({ sessionId: 1, recipientRoleId: 1, status: 1 });

export const ReportDelivery = mongoose.model<IReportDelivery>('ReportDelivery', ReportDeliverySchema);
