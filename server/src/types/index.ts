export type UserRole = 'admin' | 'instructor' | 'trainee';

export type DomainType = 'land' | 'air' | 'cyber' | 'ew';

export type DisruptionType = 'delay' | 'dropout' | 'conflicting';

export type SessionStatus = 'created' | 'active' | 'paused' | 'completed';

export type DeliveryStatus = 'scheduled' | 'delivered' | 'dropped' | 'delayed';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  organizationId?: string;
}

export interface MetricScores {
  timeliness: number;             // 0 - 100
  evidenceUse: number;            // 0 - 100
  confidenceCalibration: number;  // 0 - 100
  teamCoordination: number;       // 0 - 100
  objectiveCompletion: number;    // 0 - 100
}

export interface MetricWeights {
  timeliness: number;
  evidenceUse: number;
  confidenceCalibration: number;
  teamCoordination: number;
  objectiveCompletion: number;
}
