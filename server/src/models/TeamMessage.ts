import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamMessage extends Document {
  sessionId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRoleId: string;
  senderName: string;
  message: string;
  recipientScope: string; // 'ALL' or domain/role
  simulatedTimeSec: number;
  createdAt: Date;
}

const TeamMessageSchema = new Schema<ITeamMessage>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRoleId: { type: String, required: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true, trim: true },
    recipientScope: { type: String, default: 'ALL' },
    simulatedTimeSec: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TeamMessage = mongoose.model<ITeamMessage>('TeamMessage', TeamMessageSchema);
