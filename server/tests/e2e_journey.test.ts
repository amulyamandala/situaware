import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import { connectDB, disconnectDB } from '../src/config/db';
import { seedDatabase } from '../src/seeds/seed';
import { Session } from '../src/models/Session';
import { EventScheduler } from '../src/services/eventScheduler';

let instructorToken: string;
let landToken: string;
let airToken: string;
let cyberToken: string;
let sessionId: string;

beforeAll(async () => {
  await connectDB();
  await seedDatabase();

  // Login Instructor
  const resInst = await request(app)
    .post('/api/auth/login')
    .send({ email: 'instructor@mod.gov.in', password: 'defence123' });
  instructorToken = resInst.body.token;

  // Login Trainee Land
  const resLand = await request(app)
    .post('/api/auth/login')
    .send({ email: 'land.trainee@mod.gov.in', password: 'defence123' });
  landToken = resLand.body.token;

  // Login Trainee Air
  const resAir = await request(app)
    .post('/api/auth/login')
    .send({ email: 'air.trainee@mod.gov.in', password: 'defence123' });
  airToken = resAir.body.token;

  // Login Trainee Cyber
  const resCyber = await request(app)
    .post('/api/auth/login')
    .send({ email: 'cyber.trainee@mod.gov.in', password: 'defence123' });
  cyberToken = resCyber.body.token;

  const session = await Session.findOne({ sessionCode: 'SITU-1001' });
  sessionId = (session?._id as any).toString();
});

afterAll(async () => {
  EventScheduler.stopAllTimers();
  await disconnectDB();
});

describe('E2E Full Hackathon Demonstration Journey (SIH26248)', () => {
  it('Step 1 & 2: Trainees join session with distinct operational roles', async () => {
    // Land Trainee joins
    const joinLand = await request(app)
      .post('/api/sessions/join')
      .set('Authorization', `Bearer ${landToken}`)
      .send({ sessionCode: 'SITU-1001', roleId: 'land_lead' });
    expect(joinLand.status).toBe(200);
    expect(joinLand.body.assignedRoleId).toBe('land_lead');

    // Air Trainee joins
    const joinAir = await request(app)
      .post('/api/sessions/join')
      .set('Authorization', `Bearer ${airToken}`)
      .send({ sessionCode: 'SITU-1001', roleId: 'air_controller' });
    expect(joinAir.status).toBe(200);
    expect(joinAir.body.assignedRoleId).toBe('air_controller');

    // Cyber Trainee joins
    const joinCyber = await request(app)
      .post('/api/sessions/join')
      .set('Authorization', `Bearer ${cyberToken}`)
      .send({ sessionCode: 'SITU-1001', roleId: 'cyber_officer' });
    expect(joinCyber.status).toBe(200);
    expect(joinCyber.body.assignedRoleId).toBe('cyber_officer');
  });

  it('Step 3: Instructor starts session authoritative simulation clock', async () => {
    const res = await request(app)
      .post(`/api/sessions/${sessionId}/start`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.session.status).toBe('active');
  });

  it('Step 4: Instructor injects delay, dropout, and conflicting disruptions', async () => {
    // 1. Inject Delay for Air Domain
    const resDelay = await request(app)
      .post(`/api/sessions/${sessionId}/disruptions`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'delay',
        domain: 'air',
        parameters: { delaySec: 25 },
      });
    expect(resDelay.status).toBe(201);
    expect(resDelay.body.disruption.type).toBe('delay');

    // 2. Inject Dropout for Cyber Domain targeting Land Lead
    const resDrop = await request(app)
      .post(`/api/sessions/${sessionId}/disruptions`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'dropout',
        domain: 'cyber',
        targetRoleId: 'land_lead',
        parameters: { targetEventId: 'EV-CYBER-02' },
      });
    expect(resDrop.status).toBe(201);
    expect(resDrop.body.disruption.type).toBe('dropout');

    // 3. Inject Conflicting Intel for Land Domain
    const resConflict = await request(app)
      .post(`/api/sessions/${sessionId}/disruptions`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'conflicting',
        domain: 'land',
        targetRoleId: 'land_lead',
        parameters: { conflictDescription: 'Contradictory mountain pass accessibility' },
      });
    expect(resConflict.status).toBe(201);
    expect(resConflict.body.disruption.type).toBe('conflicting');
  });

  it('Step 5: Trainees exchange cross-domain tactical communications', async () => {
    const resMsg = await request(app)
      .post(`/api/sessions/${sessionId}/messages`)
      .set('Authorization', `Bearer ${landToken}`)
      .send({
        message: 'Scout reports route barrier at Ridge Pass. Drone feed shows clear. Cross-verifying EW spectrum.',
        senderRoleId: 'land_lead',
      });
    expect(resMsg.status).toBe(201);
    expect(resMsg.body.message.senderRoleId).toBe('land_lead');

    const resList = await request(app)
      .get(`/api/sessions/${sessionId}/messages`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(resList.status).toBe(200);
    expect(resList.body.messages.length).toBeGreaterThan(0);
  });

  it('Step 6: Trainees submit decisions evaluated against authoritative history', async () => {
    const resDec = await request(app)
      .post(`/api/sessions/${sessionId}/decisions`)
      .set('Authorization', `Bearer ${landToken}`)
      .send({
        checkpointId: 'CP-ALPHA',
        action: 'Hold main armor convoy at staging area Echo, reroute recon elements via Valley Route Charlie.',
        rationale: 'Observed contradictory drone telemetry vs ground scout reports. Prioritizing physical scout verification (EV-LAND-01) while EW noise indicates potential spoofing attempt in progress.',
        evidenceIds: ['EV-LAND-01'],
        confidence: 75,
        traineeRoleId: 'land_lead',
      });

    expect(resDec.status).toBe(201);
    expect(resDec.body.decision.action).toContain('Hold main armor convoy');
    expect(resDec.body.audit).toBeDefined();
  });

  it('Step 7: Instructor computes Decision Resilience Index (DRI) assessments', async () => {
    const res = await request(app)
      .post(`/api/sessions/${sessionId}/assessments/compute`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.assessments.length).toBeGreaterThan(0);
    expect(res.body.assessments[0].totalScore).toBeGreaterThanOrEqual(0);
    expect(res.body.assessments[0].explanations).toBeDefined();
  });

  it('Step 8: Instructor reconstructs trainee information state at decision time', async () => {
    const res = await request(app)
      .get(`/api/sessions/${sessionId}/reconstruct?roleId=land_lead`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.reconstructed.deliveredReports).toBeDefined();
    expect(res.body.reconstructed.droppedReports).toBeDefined();
  });

  it('Step 9: Instructor downloads genuine official PDF and CSV reports', async () => {
    // PDF
    const resPdf = await request(app)
      .get(`/api/aar/${sessionId}/download-pdf`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(resPdf.status).toBe(200);
    expect(resPdf.headers['content-type']).toBe('application/pdf');
    expect(resPdf.body.length).toBeGreaterThan(1000);

    // CSV
    const resCsv = await request(app)
      .get(`/api/aar/${sessionId}/download-csv`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(resCsv.status).toBe(200);
    expect(resCsv.headers['content-type']).toContain('text/csv');
    expect(resCsv.text).toContain('RecordType');
  });
});
