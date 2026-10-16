import mongoose, { Document, Schema } from 'mongoose';
import { MetricScores } from '../types';

export interface IAssessment extends Document {
  sessionId: mongoose.Types.ObjectId;
  traineeId: mongoose.Types.ObjectId;
  traineeRoleId: string;
  rubricVersion: string;
  metricScores: MetricScores;
  totalScore: number; // DRI (0 - 100)
  explanations: {
    timelinessReason: string;
    evidenceReason: string;
    confidenceReason: string;
    coordinationReason: string;
    objectiveReason: string;
  };
  instructorFeedback?: string;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    traineeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    traineeRoleId: { type: String, required: true },
    rubricVersion: { type: String, default: '1.0.0' },
    metricScores: {
      timeliness: { type: Number, required: true },
      evidenceUse: { type: Number, required: true },
      confidenceCalibration: { type: Number, required: true },
      teamCoordination: { type: Number, required: true },
      objectiveCompletion: { type: Number, required: true },
    },
    totalScore: { type: Number, required: true },
    explanations: {
      timelinessReason: { type: String, default: '' },
      evidenceReason: { type: String, default: '' },
      confidenceReason: { type: String, default: '' },
      coordinationReason: { type: String, default: '' },
      objectiveReason: { type: String, default: '' },
    },
    instructorFeedback: { type: String },
    recommendations: { type: [String], default: [] },
  },
  { timestamps: true }
);

AssessmentSchema.index({ sessionId: 1, traineeId: 1 }, { unique: true });

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
