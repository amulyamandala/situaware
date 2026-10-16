import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import { connectDB, disconnectDB } from '../src/config/db';
import { seedDatabase } from '../src/seeds/seed';
import { Scenario } from '../src/models/Scenario';
import { Session } from '../src/models/Session';
import { ResilienceEngine } from '../src/services/resilienceEngine';
import { DisruptionEngine } from '../src/services/disruptionEngine';
import { PdfService } from '../src/services/pdfService';
import { CsvService } from '../src/services/csvService';

let instructorToken: string;
let traineeToken: string;
let testScenarioId: string;
let testSessionId: string;
let testSessionCode: string;

beforeAll(async () => {
  await connectDB();
  await seedDatabase();

  // Login instructor
  const resInst = await request(app)
    .post('/api/auth/login')
    .send({ email: 'instructor@mod.gov.in', password: 'defence123' });
  instructorToken = resInst.body.token;

  // Login trainee
  const resTrainee = await request(app)
    .post('/api/auth/login')
    .send({ email: 'land.trainee@mod.gov.in', password: 'defence123' });
  traineeToken = resTrainee.body.token;

  const scenario = await Scenario.findOne();
  testScenarioId = (scenario?._id as any).toString();

  const session = await Session.findOne({ sessionCode: 'SITU-1001' });
  testSessionId = (session?._id as any).toString();
  testSessionCode = session?.sessionCode || 'SITU-1001';
});

afterAll(async () => {
  const { EventScheduler } = await import('../src/services/eventScheduler');
  EventScheduler.stopAllTimers();
  await disconnectDB();
});

describe('1. Authentication and Role-Based Permissions', () => {
  it('should authenticate user and return valid JWT with role payload', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'instructor@mod.gov.in', password: 'defence123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('instructor');
  });

  it('should reject unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/scenarios');
    expect(res.status).toBe(401);
  });

  it('should reject unauthorized role from instructor-only actions', async () => {
    const res = await request(app)
      .post(`/api/sessions/from-scenario/${testScenarioId}`)
      .set('Authorization', `Bearer ${traineeToken}`)
      .send({});
    expect(res.status).toBe(403);
  });
});

describe('2. Scenario Creation and Validation', () => {
  it('should validate scenario rubric weights sum to 1.0', async () => {
    const res = await request(app)
      .post(`/api/scenarios/${testScenarioId}/validate`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.isValid).toBe(true);
    expect(res.body.summary.domains).toContain('land');
    expect(res.body.summary.domains).toContain('air');
    expect(res.body.summary.domains).toContain('cyber');
    expect(res.body.summary.domains).toContain('ew');
  });
});

describe('3. Session Lifecycle Transitions', () => {
  it('should start, pause, resume and complete a session', async () => {
    // Start
    const startRes = await request(app)
      .post(`/api/sessions/${testSessionId}/start`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(startRes.status).toBe(200);
    expect(startRes.body.session.status).toBe('active');

    // Pause
    const pauseRes = await request(app)
      .post(`/api/sessions/${testSessionId}/pause`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(pauseRes.status).toBe(200);
    expect(pauseRes.body.session.status).toBe('paused');

    // Resume
    const resumeRes = await request(app)
      .post(`/api/sessions/${testSessionId}/resume`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(resumeRes.status).toBe(200);
    expect(resumeRes.body.session.status).toBe('active');
  });
});

describe('4. Communication Degradation Engine (Delays, Dropouts, Conflicts)', () => {
  it('should inject a live delay disruption', async () => {
    const res = await request(app)
      .post(`/api/sessions/${testSessionId}/disruptions`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'delay',
        domain: 'air',
        parameters: { delaySec: 20 },
      });
    expect(res.status).toBe(201);
    expect(res.body.disruption.type).toBe('delay');
  });

  it('should evaluate dropout mutation correctly in DisruptionEngine', () => {
    const eventDef = {
      eventId: 'EV-TEST-01',
      domain: 'ew',
      payload: { text: 'Test EW payload', confidence: 90 },
      deliveryPolicy: {},
    };
    const activeDisruptions = [
      {
        id: 'DIS-1',
        type: 'dropout' as const,
        domain: 'ew',
        parameters: {},
        injectedAt: new Date(),
        injectedBy: null as any,
      },
    ];

    const result = DisruptionEngine.evaluateDelivery(eventDef, 'land_lead', activeDisruptions, 10);
    expect(result.status).toBe('dropped');
    expect(result.failureReason).toBeDefined();
  });

  it('should evaluate conflicting mutated payload in DisruptionEngine', () => {
    const eventDef = {
      eventId: 'EV-TEST-LAND',
      domain: 'land',
      payload: { text: 'Pass is open', confidence: 90 },
      deliveryPolicy: {},
    };
    const activeDisruptions = [
      {
        id: 'DIS-2',
        type: 'conflicting' as const,
        domain: 'land',
        parameters: {},
        injectedAt: new Date(),
        injectedBy: null as any,
      },
    ];

    const result = DisruptionEngine.evaluateDelivery(eventDef, 'land_lead', activeDisruptions, 15);
    expect(result.isConflicting).toBe(true);
    expect(result.payload.text).toContain('CONTRADICTORY INTEL');
  });
});

describe('5. Decision Resilience Engine & Evidence Verification', () => {
  it('should verify cited evidence against delivered information records', async () => {
    const completedSession = await Session.findOne({ sessionCode: 'SITU-8800' });
    const sessionId = (completedSession?._id as any).toString();

    // Submit decision with 1 verified evidence ID and 1 non-existent/unreceived evidence ID
    const res = await request(app)
      .post(`/api/sessions/${sessionId}/decisions`)
      .set('Authorization', `Bearer ${traineeToken}`)
      .send({
        action: 'Deploy counter-battery fire at suspected enemy coordinates',
        rationale: 'Observed radar track and artillery flash signature',
        evidenceIds: ['EV-LAND-01', 'EV-FABRICATED-FAKE-99'],
        confidence: 75,
        traineeRoleId: 'land_lead',
        checkpointId: 'CP-ALPHA',
      });

    expect(res.status).toBe(201);
    expect(res.body.audit.verifiedEvidence).toContain('EV-LAND-01');
    expect(res.body.audit.unverifiedEvidence).toContain('EV-FABRICATED-FAKE-99');
  });

  it('should compute explainable DRI score and recommendations', async () => {
    const completedSession = await Session.findOne({ sessionCode: 'SITU-8800' });
    const sessionId = (completedSession?._id as any).toString();

    const res = await request(app)
      .post(`/api/sessions/${sessionId}/assessments/compute`)
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.assessments.length).toBeGreaterThan(0);
    const assessment = res.body.assessments[0];
    expect(assessment.totalScore).toBeGreaterThanOrEqual(0);
    expect(assessment.totalScore).toBeLessThanOrEqual(100);
    expect(assessment.explanations.timelinessReason).toBeDefined();
    expect(assessment.recommendations.length).toBeGreaterThan(0);
  });
});

describe('6. Exportable AAR Generation (PDF & CSV)', () => {
  it('should generate valid PDFKit binary buffer with proper headers', async () => {
    const completedSession = await Session.findOne({ sessionCode: 'SITU-8800' });
    const sessionId = (completedSession?._id as any).toString();

    const res = await request(app)
      .get(`/api/aar/${sessionId}/download-pdf`)
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.body.length).toBeGreaterThan(1000); // Has actual PDF binary content
  });

  it('should generate structured CSV with recorded audit events and DRI scores', async () => {
    const completedSession = await Session.findOne({ sessionCode: 'SITU-8800' });
    const sessionId = (completedSession?._id as any).toString();

    const res = await request(app)
      .get(`/api/aar/${sessionId}/download-csv`)
      .set('Authorization', `Bearer ${instructorToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('RecordType');
    expect(res.text).toContain('REPORT_DELIVERY');
    expect(res.text).toContain('DECISION');
    expect(res.text).toContain('ASSESSMENT');
  });
});
