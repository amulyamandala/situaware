export type UserRole = 'admin' | 'instructor' | 'trainee';

export type DomainType = 'land' | 'air' | 'cyber' | 'ew';

export type DisruptionType = 'delay' | 'dropout' | 'conflicting';

export type SessionStatus = 'created' | 'active' | 'paused' | 'completed';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  status: 'active' | 'inactive';
}

export interface ScenarioRole {
  roleId: string;
  name: string;
  domain: string;
  description: string;
  permissions: string[];
}

export interface ScenarioCheckpoint {
  id: string;
  title: string;
  dueTimeSec: number;
  expectedAction: string;
  keyEvidenceEventIds: string[];
  optimalConfidenceRange: [number, number];
}

export interface ScenarioRubric {
  version: string;
  weights: {
    timeliness: number;
    evidenceUse: number;
    confidenceCalibration: number;
    teamCoordination: number;
    objectiveCompletion: number;
  };
  checkpoints: ScenarioCheckpoint[];
}

export interface ScenarioEventDef {
  eventId: string;
  sequence: number;
  title: string;
  domain: DomainType;
  eventType: string;
  scheduledTimeOffsetSec: number;
  intendedRecipients: string[];
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
  deliveryPolicy?: any;
}

export interface Scenario {
  _id: string;
  title: string;
  description: string;
  version: string;
  domains: DomainType[];
  durationMinutes: number;
  roleDefinitions: ScenarioRole[];
  eventDefinitions: ScenarioEventDef[];
  scoringRubric: ScenarioRubric;
  learningObjectives: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface SessionParticipant {
  userId: string | User;
  roleId: string;
  roleName: string;
  isOnline: boolean;
  joinedAt: string;
}

export interface ActiveDisruption {
  id: string;
  type: DisruptionType;
  domain?: string;
  targetRoleId?: string;
  parameters: any;
  injectedAt: string;
}

export interface Session {
  _id: string;
  scenarioId: Scenario | string;
  scenarioVersion: string;
  sessionCode: string;
  status: SessionStatus;
  participantIds: SessionParticipant[];
  startedAt?: string;
  pausedAt?: string;
  endedAt?: string;
  currentSimulatedTimeSec: number;
  activeDisruptions: ActiveDisruption[];
  createdBy: User | string;
  createdAt: string;
}

export interface FeedReport {
  deliveryId: string;
  eventId: string;
  domain: DomainType;
  title: string;
  eventType: string;
  payload: any;
  deliveredAt: string;
  simulatedTimeSec: number;
  isConflicting?: boolean;
  wasDelayed?: boolean;
  delaySec?: number;
}

export interface DecisionRecord {
  _id: string;
  sessionId: string;
  traineeId: User | string;
  traineeRoleId: string;
  checkpointId?: string;
  submittedAt: string;
  exerciseTimeSec: number;
  action: string;
  rationale: string;
  evidenceIds: string[];
  verifiedEvidenceIds: string[];
  unverifiedEvidenceIds: string[];
  confidence: number;
  rubricVersion: string;
}

export interface TeamMessageRecord {
  _id: string;
  sessionId: string;
  senderId: string;
  senderRoleId: string;
  senderName: string;
  message: string;
  recipientScope: string;
  simulatedTimeSec: number;
  createdAt: string;
}

export interface AssessmentRecord {
  _id: string;
  sessionId: string;
  traineeId: User | string;
  traineeRoleId: string;
  rubricVersion: string;
  metricScores: {
    timeliness: number;
    evidenceUse: number;
    confidenceCalibration: number;
    teamCoordination: number;
    objectiveCompletion: number;
  };
  totalScore: number;
  explanations: {
    timelinessReason: string;
    evidenceReason: string;
    confidenceReason: string;
    coordinationReason: string;
    objectiveReason: string;
  };
  instructorFeedback?: string;
  recommendations: string[];
  createdAt: string;
}
