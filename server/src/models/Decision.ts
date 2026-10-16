import mongoose, { Document, Schema } from 'mongoose';

export interface IDecision extends Document {
  sessionId: mongoose.Types.ObjectId;
  traineeId: mongoose.Types.ObjectId;
  traineeRoleId: string;
  checkpointId?: string;
  submittedAt: Date;
  exerciseTimeSec: number;
  action: string;
  rationale: string;
  evidenceIds: string[];
  verifiedEvidenceIds: string[];
  unverifiedEvidenceIds: string[];
  confidence: number;
  rubricVersion: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const DecisionSchema = new Schema<IDecision>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    traineeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    traineeRoleId: { type: String, required: true },
    checkpointId: { type: String },
    submittedAt: { type: Date, default: Date.now },
    exerciseTimeSec: { type: Number, required: true },
    action: { type: String, required: true },
    rationale: { type: String, required: true },
    evidenceIds: { type: [String], default: [] },
    verifiedEvidenceIds: { type: [String], default: [] },
    unverifiedEvidenceIds: { type: [String], default: [] },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    rubricVersion: { type: String, default: '1.0.0' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

DecisionSchema.index({ sessionId: 1, traineeId: 1, checkpointId: 1 });

export const Decision = mongoose.model<IDecision>('Decision', DecisionSchema);
