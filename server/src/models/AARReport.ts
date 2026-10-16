import mongoose, { Document, Schema } from 'mongoose';

export interface IAARReport extends Document {
  sessionId: mongoose.Types.ObjectId;
  generatedBy: mongoose.Types.ObjectId;
  format: 'pdf' | 'csv' | 'both';
  generatedAt: Date;
  summary: any;
  pdfPath?: string;
  csvPath?: string;
  status: 'ready' | 'generating' | 'failed';
  createdAt: Date;
}

const AARReportSchema = new Schema<IAARReport>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    format: { type: String, enum: ['pdf', 'csv', 'both'], default: 'both' },
    generatedAt: { type: Date, default: Date.now },
    summary: { type: Schema.Types.Mixed, default: {} },
    pdfPath: { type: String },
    csvPath: { type: String },
    status: { type: String, enum: ['ready', 'generating', 'failed'], default: 'ready' },
  },
  { timestamps: true }
);

export const AARReport = mongoose.model<IAARReport>('AARReport', AARReportSchema);
