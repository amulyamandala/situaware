import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Scenario } from '../models/Scenario';
import { Session } from '../models/Session';
import { SessionEvent } from '../models/SessionEvent';
import { ReportDelivery } from '../models/ReportDelivery';
import { Decision } from '../models/Decision';
import { TeamMessage } from '../models/TeamMessage';
import { Assessment } from '../models/Assessment';
import { AARReport } from '../models/AARReport';

export async function seedDatabase() {
  console.log('[Seed] Starting database seed process...');
  await connectDB();

  // Clean existing collections
  await Promise.all([
    User.deleteMany({}),
    Scenario.deleteMany({}),
    Session.deleteMany({}),
    SessionEvent.deleteMany({}),
    ReportDelivery.deleteMany({}),
    Decision.deleteMany({}),
    TeamMessage.deleteMany({}),
    Assessment.deleteMany({}),
    AARReport.deleteMany({}),
  ]);

  console.log('[Seed] Collections cleared.');

  // 1. Create Default Users
  const passwordHash = await bcrypt.hash('defence123', 10);

  const admin = await User.create({
    name: 'Command HQ Administrator',
    email: 'admin@mod.gov.in',
    passwordHash,
    role: 'admin',
    organizationId: 'IN-MOD-HQ',
    status: 'active',
  });

  const instructor = await User.create({
    name: 'Col. Rajiv Sharma',
    email: 'instructor@mod.gov.in',
    passwordHash,
    role: 'instructor',
    organizationId: 'IN-MOD-HQ',
    status: 'active',
  });

  const traineeLand = await User.create({
    name: 'Major A. Verma (Land)',
    email: 'land.trainee@mod.gov.in',
    passwordHash,
    role: 'trainee',
    organizationId: '1st Strike Corps',
    status: 'active',
  });

  const traineeAir = await User.create({
    name: 'Sqn Ldr R. Sen (Air)',
    email: 'air.trainee@mod.gov.in',
    passwordHash,
    role: 'trainee',
    organizationId: 'Air Defense Wing 4',
    status: 'active',
  });

  const traineeCyber = await User.create({
    name: 'Capt. K. Roy (Cyber)',
    email: 'cyber.trainee@mod.gov.in',
    passwordHash,
    role: 'trainee',
    organizationId: 'Defence Cyber Agency',
    status: 'active',
  });

  const traineeEW = await User.create({
    name: 'Lt Cdr V. Rao (EW)',
    email: 'ew.trainee@mod.gov.in',
    passwordHash,
    role: 'trainee',
    organizationId: 'EW Directorate 12',
    status: 'active',
  });

  console.log('[Seed] Users seeded successfully.');

  // 2. Create Scenarios
  // Scenario 1: Operation Trishul Guard
  const trishulScenario = await Scenario.create({
    title: 'Operation Trishul Guard — Contested Border Defense',
    description: 'Multi-domain operational scenario testing decision resilience during hostile border incursion under heavy EW jamming, conflicting sensor tracks, and targeted cyber telemetry outages.',
    version: '1.2.0',
    domains: ['land', 'air', 'cyber', 'ew'],
    durationMinutes: 15,
    status: 'published',
    createdBy: instructor._id,
    learningObjectives: [
      'Correlate disparate domain observations when primary digital channels experience dropouts.',
      'Identify and reconcile contradictory ground and air sensor intelligence.',
      'Maintain synchronized tactical decisions across joint commands despite EW degradation.',
      'Submit calibrated confidence rationales based solely on verified information.',
    ],
    roleDefinitions: [
      {
        roleId: 'land_lead',
        name: 'Land Domain Lead',
        domain: 'land',
        description: 'Directs mechanized infantry, tactical artillery vectors, and forward perimeter checkpoints.',
        permissions: ['read:land', 'read:all_shared', 'submit:decision'],
      },
      {
        roleId: 'air_controller',
        name: 'Joint Air Defense Controller',
        domain: 'air',
        description: 'Monitors early warning radar tracks, airspace corridors, and tactical CAP tasking.',
        permissions: ['read:air', 'read:all_shared', 'submit:decision'],
      },
      {
        roleId: 'cyber_officer',
        name: 'Tactical Cyber Specialist',
        domain: 'cyber',
        description: 'Oversees command network integrity, encrypted data links, and defensive cyber countermeasures.',
        permissions: ['read:cyber', 'read:all_shared', 'submit:decision'],
      },
      {
        roleId: 'ew_officer',
        name: 'Electronic Warfare Officer',
        domain: 'ew',
        description: 'Monitors spectrum analyzer sweeps, identifies hostile RF jammers, and coordinates frequency hopping.',
        permissions: ['read:ew', 'read:all_shared', 'submit:decision'],
      },
    ],
    scoringRubric: {
      version: '1.2.0',
      weights: {
        timeliness: 0.20,
        evidenceUse: 0.25,
        confidenceCalibration: 0.20,
        teamCoordination: 0.20,
        objectiveCompletion: 0.15,
      },
      checkpoints: [
        {
          id: 'CP-ALPHA',
          title: 'Perimeter Breach & Route Validation',
          dueTimeSec: 60,
          expectedAction: 'Halt advance convoy along Sector B route, redirect via Valley Corridor, and order recon drone scout.',
          keyEvidenceEventIds: ['EV-LAND-01', 'EV-EW-01'],
          optimalConfidenceRange: [65, 80],
        },
        {
          id: 'CP-BRAVO',
          title: 'Unidentified Air Contact Response',
          dueTimeSec: 150,
          expectedAction: 'Interrogate contact on secondary secure IFF channel, scramble alert CAP, and hold surface-to-air missile fire.',
          keyEvidenceEventIds: ['EV-AIR-02', 'EV-CYBER-02'],
          optimalConfidenceRange: [70, 85],
        },
        {
          id: 'CP-CHARLIE',
          title: 'Joint Resiliency Countermeasure Directive',
          dueTimeSec: 240,
          expectedAction: 'Initiate frequency hopping to Alternate Bravo, isolate telemetry node Beta, and deploy localized EW smoke screens.',
          keyEvidenceEventIds: ['EV-CYBER-03', 'EV-EW-03', 'EV-LAND-03'],
          optimalConfidenceRange: [75, 90],
        },
      ],
    },
    disruptionConfiguration: {
      presets: [
        {
          id: 'PRESET-EW-JAM',
          name: 'Battalion EW Barrage Jamming',
          type: 'dropout',
          parameters: { targetDomain: 'ew', dropPercentage: 70 },
        },
        {
          id: 'PRESET-CYBER-DELAY',
          name: 'Tactical Edge Router Congestion',
          type: 'delay',
          parameters: { delaySec: 25, targetDomain: 'cyber' },
        },
        {
          id: 'PRESET-LAND-CONFLICT',
          name: 'Divergent Recon Field Reports',
          type: 'conflicting',
          parameters: { targetDomain: 'land', conflictDescription: 'Conflicting pass availability' },
        },
      ],
    },
    eventDefinitions: [
      // Land Events
      {
        eventId: 'EV-LAND-01',
        sequence: 1,
        title: 'Forward Recon: Ridge Pass Roadblock',
        domain: 'land',
        eventType: 'observation',
        scheduledTimeOffsetSec: 10,
        intendedRecipients: ['land_lead', 'ALL'],
        payload: {
          text: 'Scout Squad Bravo reports primary mountain pass road has anti-tank mine obstacle and cratering at Grid Ref 4492-8112. Road impassable for heavy armor.',
          source: 'Scout Unit 3 / 14th Mech',
          confidence: 85,
          classification: 'RESTRICTED',
          coordinates: { lat: 34.152, lng: 77.577, label: 'Ridge Pass Obstacle' },
        },
        deliveryPolicy: {
          defaultDelaySec: 0,
          conflictingVariants: [
            {
              variantId: 'VAR-LAND-01-ALT',
              recipients: ['land_lead'],
              alteredPayload: {
                text: 'Recon drone telemetry shows pass road is CLEAR of hostile barricades; minor landslide debris passable with light engineering support.',
                confidence: 60,
                source: 'Automated UAV Recon Alpha',
              },
            },
          ],
        },
      },
      {
        eventId: 'EV-LAND-02',
        sequence: 5,
        title: 'Infantry Perimeter Probe',
        domain: 'land',
        eventType: 'hostile_contact',
        scheduledTimeOffsetSec: 50,
        intendedRecipients: ['land_lead', 'ew_officer'],
        payload: {
          text: 'Observation Post 4 reports sporadic small-arms fire and thermal silhouettes moving along lower wooded ridge line. Contact breaking into two fireteams.',
          source: 'OP 4 Forward Guard',
          confidence: 90,
          coordinates: { lat: 34.168, lng: 77.592, label: 'Hostile Probe OP-4' },
        },
        deliveryPolicy: { defaultDelaySec: 0 },
      },
      {
        eventId: 'EV-LAND-03',
        sequence: 9,
        title: 'Valley Sector Alternate Route Survey',
        domain: 'land',
        eventType: 'terrain_report',
        scheduledTimeOffsetSec: 140,
        intendedRecipients: ['land_lead', 'ALL'],
        payload: {
          text: 'Combat engineers confirm Valley Bypass Route Charlie has firm gravel base and zero hostile sign. Maximum convoy speed 35 km/h.',
          source: '12th Engineer Regiment',
          confidence: 95,
          coordinates: { lat: 34.135, lng: 77.561, label: 'Valley Bypass Open' },
        },
        deliveryPolicy: { defaultDelaySec: 5 },
      },

      // Air Events
      {
        eventId: 'EV-AIR-01',
        sequence: 2,
        title: 'Radar Sweep: Sector Northern Approach',
        domain: 'air',
        eventType: 'radar_contact',
        scheduledTimeOffsetSec: 20,
        intendedRecipients: ['air_controller', 'ALL'],
        payload: {
          text: 'Primary Surveillance Radar 3 detects low-RCS contact inbound at 480 kts, heading 175, altitude 4,500m AGL. Transponder silent.',
          source: 'Air Defense Radar Net-3',
          confidence: 78,
          classification: 'CONFIDENTIAL',
          radarTrack: { trackId: 'TRK-9041', heading: 175, speed: 480, altitude: 4500, type: 'UNKNOWN_FAST_MOVER' },
        },
        deliveryPolicy: { defaultDelaySec: 0 },
      },
      {
        eventId: 'EV-AIR-02',
        sequence: 6,
        title: 'CAP Escort Intercept Vector',
        domain: 'air',
        eventType: 'airspace_alert',
        scheduledTimeOffsetSec: 80,
        intendedRecipients: ['air_controller', 'ew_officer'],
        payload: {
          text: 'Alert CAP pair "Viper Flight" vectored to intercept Track TRK-9041. Contact executing evasive descent into radar shadow behind western ridgeline.',
          source: 'Tactical Air Control Post 2',
          confidence: 82,
          radarTrack: { trackId: 'TRK-9041', heading: 210, speed: 510, altitude: 2200, type: 'EVASIVE_DESCENT' },
        },
        deliveryPolicy: { defaultDelaySec: 0 },
      },
      {
        eventId: 'EV-AIR-03',
        sequence: 10,
        title: 'IFF Transponder Interrogation Status',
        domain: 'air',
        eventType: 'observation',
        scheduledTimeOffsetSec: 170,
        intendedRecipients: ['air_controller', 'ALL'],
        payload: {
          text: 'Secondary Mode-5 IFF interrogation returned valid crypto response code for friendly border surveillance UAV, but telemetry payload appears desynchronized.',
          source: 'Joint Air Operations Center',
          confidence: 88,
        },
        deliveryPolicy: { defaultDelaySec: 0 },
      },

      // Cyber Events
      {
        eventId: 'EV-CYBER-01',
        sequence: 3,
        title: 'Gateway Router Telemetry Alert',
        domain: 'cyber',
        eventType: 'cyber_alert',
        scheduledTimeOffsetSec: 30,
        intendedRecipients: ['cyber_officer', 'ALL'],
        payload: {
          text: 'Tactical WAN Gateway Node-Gamma reports sudden 42% packet loss and elevated cryptographic re-handshake errors on tactical backhaul.',
          source: 'Security Operations Center (SOC)',
          confidence: 94,
          cyberNode: { systemName: 'WAN-Gateway-Gamma', status: 'degraded', latencyMs: 380 },
        },
        deliveryPolicy: { defaultDelaySec: 0 },
      },
      {
        eventId: 'EV-CYBER-02',
        sequence: 7,
        title: 'Sensor Grid False Injection Detection',
        domain: 'cyber',
        eventType: 'cyber_alert',
        scheduledTimeOffsetSec: 100,
        intendedRecipients: ['cyber_officer', 'land_lead'],
        payload: {
          text: 'Intrusion Detection System flagged synthetic GPS spoofing and packet repetition targeting Sector 2 ground acoustic sensor relay.',
          source: 'Tactical Defensive Cyber Cell',
          confidence: 91,
          cyberNode: { systemName: 'Ground-Relay-S2', status: 'offline', latencyMs: 9999 },
        },
        deliveryPolicy: { defaultDelaySec: 10 },
      },
      {
        eventId: 'EV-CYBER-03',
        sequence: 11,
        title: 'Emergency Encrypted Channel Switch',
        domain: 'cyber',
        eventType: 'status_alert',
        scheduledTimeOffsetSec: 190,
        intendedRecipients: ['cyber_officer', 'ALL'],
        payload: {
          text: 'Tactical comms failover protocol initialized. Switching primary data transport to Optical Burst & Troposcatter auxiliary mesh.',
          source: 'Cyber Defense Directorate',
          confidence: 96,
          cyberNode: { systemName: 'Aux-Mesh-Net', status: 'nominal', latencyMs: 45 },
        },
        deliveryPolicy: { defaultDelaySec: 0 },
      },

      // Electronic Warfare (EW) Events
      {
        eventId: 'EV-EW-01',
        sequence: 4,
        title: 'Spectrum Sweep: High-Power Barrage Detected',
        domain: 'ew',
        eventType: 'ew_intercept',
        scheduledTimeOffsetSec: 40,
        intendedRecipients: ['ew_officer', 'ALL'],
        payload: {
          text: 'Passive ESM receiver 7 detected high-power directional noise jamming centered at 284.5 MHz (VHF Tactical Air/Ground net). Estimated bearing 320 degrees.',
          source: 'ESM Mast Unit 7',
          confidence: 89,
          ewSignal: { freqMhz: 284.5, signalStrength: 92, jammerDetected: true, reliability: 40 },
        },
        deliveryPolicy: { defaultDelaySec: 0 },
      },
      {
        eventId: 'EV-EW-02',
        sequence: 8,
        title: 'Hostile Jammer Triangulation',
        domain: 'ew',
        eventType: 'ew_intercept',
        scheduledTimeOffsetSec: 120,
        intendedRecipients: ['ew_officer', 'land_lead'],
        payload: {
          text: 'Direction finding baseline (Stations Alpha & Charlie) fixes hostile electronic jammer vehicle at Grid Ref 4108-8320 (elev. 3,120m).',
          source: 'Joint EW Analysis Cell',
          confidence: 86,
          ewSignal: { freqMhz: 284.5, signalStrength: 85, jammerDetected: true, reliability: 80 },
        },
        deliveryPolicy: { defaultDelaySec: 0 },
      },
      {
        eventId: 'EV-EW-03',
        sequence: 12,
        title: 'Counter-Jamming Frequency Hopping Confirmed',
        domain: 'ew',
        eventType: 'comms_status',
        scheduledTimeOffsetSec: 210,
        intendedRecipients: ['ew_officer', 'ALL'],
        payload: {
          text: 'ECCM frequency hopping active across 500 hops/sec on band 30-88 MHz. Tactical voice and data links restored to 92% signal-to-noise ratio.',
          source: 'EW Squadron 10',
          confidence: 93,
          ewSignal: { freqMhz: 65.2, signalStrength: 88, jammerDetected: false, reliability: 95 },
        },
        deliveryPolicy: { defaultDelaySec: 0 },
      },
    ],
  });

  console.log(`[Seed] Scenario created: ${trishulScenario.title} (${trishulScenario._id})`);

  // 3. Create Sample Ready Session
  const sampleSession = await Session.create({
    scenarioId: trishulScenario._id,
    scenarioVersion: trishulScenario.version,
    sessionCode: 'SITU-1001',
    status: 'created',
    participantIds: [
      {
        userId: traineeLand._id,
        roleId: 'land_lead',
        roleName: 'Land Domain Lead',
        isOnline: false,
      },
      {
        userId: traineeAir._id,
        roleId: 'air_controller',
        roleName: 'Joint Air Defense Controller',
        isOnline: false,
      },
      {
        userId: traineeCyber._id,
        roleId: 'cyber_officer',
        roleName: 'Tactical Cyber Specialist',
        isOnline: false,
      },
      {
        userId: traineeEW._id,
        roleId: 'ew_officer',
        roleName: 'Electronic Warfare Officer',
        isOnline: false,
      },
    ],
    createdBy: instructor._id,
    randomSeed: 482910,
    currentSimulatedTimeSec: 0,
  });

  console.log(`[Seed] Ready Session created: ${sampleSession.sessionCode} (${sampleSession._id})`);

  // 4. Create Sample Completed Historical Session with Full Records for Immediate AAR Demo
  const completedSession = await Session.create({
    scenarioId: trishulScenario._id,
    scenarioVersion: trishulScenario.version,
    sessionCode: 'SITU-8800',
    status: 'completed',
    participantIds: [
      {
        userId: traineeLand._id,
        roleId: 'land_lead',
        roleName: 'Land Domain Lead',
        isOnline: false,
      },
      {
        userId: traineeAir._id,
        roleId: 'air_controller',
        roleName: 'Joint Air Defense Controller',
        isOnline: false,
      },
      {
        userId: traineeCyber._id,
        roleId: 'cyber_officer',
        roleName: 'Tactical Cyber Specialist',
        isOnline: false,
      },
      {
        userId: traineeEW._id,
        roleId: 'ew_officer',
        roleName: 'Electronic Warfare Officer',
        isOnline: false,
      },
    ],
    startedAt: new Date(Date.now() - 3600000),
    endedAt: new Date(Date.now() - 1800000),
    currentSimulatedTimeSec: 300,
    createdBy: instructor._id,
    randomSeed: 123456,
    activeDisruptions: [
      {
        id: 'DISRUPT-DEMO-01',
        type: 'delay',
        domain: 'air',
        parameters: { delaySec: 25 },
        injectedAt: new Date(Date.now() - 3400000),
        injectedBy: instructor._id,
      },
      {
        id: 'DISRUPT-DEMO-02',
        type: 'dropout',
        domain: 'cyber',
        targetRoleId: 'land_lead',
        parameters: { targetEventId: 'EV-CYBER-02' },
        injectedAt: new Date(Date.now() - 3200000),
        injectedBy: instructor._id,
      },
      {
        id: 'DISRUPT-DEMO-03',
        type: 'conflicting',
        domain: 'land',
        targetRoleId: 'land_lead',
        parameters: { conflictDescription: 'Conflicting pass availability' },
        injectedAt: new Date(Date.now() - 3000000),
        injectedBy: instructor._id,
      },
    ],
  });

  // Seed events & report deliveries for completed session
  let seq = 1;
  for (const evDef of trishulScenario.eventDefinitions) {
    const sessionEvent = await SessionEvent.create({
      sessionId: completedSession._id,
      sequence: seq++,
      eventId: evDef.eventId,
      eventType: evDef.eventType,
      domain: evDef.domain,
      title: evDef.title,
      scheduledAt: new Date(completedSession.startedAt!.getTime() + evDef.scheduledTimeOffsetSec * 1000),
      createdAt: new Date(completedSession.startedAt!.getTime() + evDef.scheduledTimeOffsetSec * 1000),
      simulatedTimeSec: evDef.scheduledTimeOffsetSec,
      payload: evDef.payload,
      intendedRecipients: evDef.intendedRecipients,
      deliveryPolicy: evDef.deliveryPolicy,
    });

    const targetRoles = ['land_lead', 'air_controller', 'cyber_officer', 'ew_officer'];
    for (const r of targetRoles) {
      const isDropped = evDef.eventId === 'EV-CYBER-02' && r === 'land_lead';
      const isDelayed = evDef.domain === 'air';
      await ReportDelivery.create({
        sessionId: completedSession._id,
        eventId: evDef.eventId,
        sessionEventId: sessionEvent._id,
        recipientRoleId: r,
        status: isDropped ? 'dropped' : 'delivered',
        scheduledAt: sessionEvent.scheduledAt,
        deliveredAt: isDropped ? undefined : new Date(sessionEvent.scheduledAt.getTime() + (isDelayed ? 25000 : 0)),
        delayAppliedSec: isDelayed ? 25 : 0,
        isConflictingVariant: evDef.eventId === 'EV-LAND-01' && r === 'land_lead',
        deliveredPayload: evDef.payload,
        failureReason: isDropped ? 'Simulated dropout disruption targeting land lead.' : undefined,
      });
    }
  }

  // Seed decisions for completed session
  await Decision.create([
    {
      sessionId: completedSession._id,
      traineeId: traineeLand._id,
      traineeRoleId: 'land_lead',
      checkpointId: 'CP-ALPHA',
      submittedAt: new Date(completedSession.startedAt!.getTime() + 55000),
      exerciseTimeSec: 55,
      action: 'Hold main convoy at staging area Echo. Re-route reconnaissance elements through Valley Route Charlie to circumvent mine barrier at Ridge Pass.',
      rationale: 'Observed contradictory drone telemetry vs ground scout reports. Prioritizing physical scout verification (EV-LAND-01) while EW noise indicates potential spoofing attempt in progress.',
      evidenceIds: ['EV-LAND-01', 'EV-EW-01'],
      verifiedEvidenceIds: ['EV-LAND-01', 'EV-EW-01'],
      unverifiedEvidenceIds: [],
      confidence: 75,
      rubricVersion: '1.2.0',
    },
    {
      sessionId: completedSession._id,
      traineeId: traineeAir._id,
      traineeRoleId: 'air_controller',
      checkpointId: 'CP-BRAVO',
      submittedAt: new Date(completedSession.startedAt!.getTime() + 145000),
      exerciseTimeSec: 145,
      action: 'Maintain defensive CAP orbit over western approach. Hold missile release pending visual confirmation from Viper Flight.',
      rationale: 'Track TRK-9041 exhibited erratic radar altitude variations; radar report EV-AIR-02 arrived with 25s latency. Awaiting Mode-5 IFF resolution before authorizing weapons free.',
      evidenceIds: ['EV-AIR-01', 'EV-AIR-02'],
      verifiedEvidenceIds: ['EV-AIR-01', 'EV-AIR-02'],
      unverifiedEvidenceIds: [],
      confidence: 80,
      rubricVersion: '1.2.0',
    },
  ]);

  // Seed team messages
  await TeamMessage.create([
    {
      sessionId: completedSession._id,
      senderId: traineeLand._id,
      senderRoleId: 'land_lead',
      senderName: 'Major A. Verma (Land)',
      message: 'Comms check on tactical net. Scout team reports barrier at Ridge Pass, but drone shows clear. Anyone seeing spoofing?',
      recipientScope: 'ALL',
      simulatedTimeSec: 25,
      createdAt: new Date(completedSession.startedAt!.getTime() + 25000),
    },
    {
      sessionId: completedSession._id,
      senderId: traineeEW._id,
      senderRoleId: 'ew_officer',
      senderName: 'Lt Cdr V. Rao (EW)',
      message: 'EW Net confirms 284 MHz barrage jamming from bearing 320. Sensor telemetry is suspect. Recommend switching to alternate net.',
      recipientScope: 'ALL',
      simulatedTimeSec: 42,
      createdAt: new Date(completedSession.startedAt!.getTime() + 42000),
    },
    {
      sessionId: completedSession._id,
      senderId: traineeCyber._id,
      senderRoleId: 'cyber_officer',
      senderName: 'Capt. K. Roy (Cyber)',
      message: 'Acknowledged EW. Gateway Gamma is experiencing packet loss. Failover to Troposcatter mesh underway.',
      recipientScope: 'ALL',
      simulatedTimeSec: 68,
      createdAt: new Date(completedSession.startedAt!.getTime() + 68000),
    },
  ]);

  // Seed Assessment
  await Assessment.create([
    {
      sessionId: completedSession._id,
      traineeId: traineeLand._id,
      traineeRoleId: 'land_lead',
      rubricVersion: '1.2.0',
      metricScores: {
        timeliness: 92,
        evidenceUse: 88,
        confidenceCalibration: 85,
        teamCoordination: 80,
        objectiveCompletion: 90,
      },
      totalScore: 87, // DRI
      explanations: {
        timelinessReason: 'Submitted Checkpoint Alpha decision 5 seconds before target deadline.',
        evidenceReason: 'Correctly verified received scout reports; avoided citing unreceived sensor dropouts.',
        confidenceReason: 'Confidence of 75% appropriately reflected high operational uncertainty and conflicting intel.',
        coordinationReason: 'Cross-checked sensor validity with EW lead over team comms net.',
        objectiveReason: 'Safely preserved convoy armor while maintaining tactical forward awareness.',
      },
      instructorFeedback: 'Excellent decision resilience under contested telemetry conditions. Sound cross-domain coordination.',
      recommendations: [
        'Continue proactive cross-domain verification when drone and scout reports diverge.',
      ],
    },
    {
      sessionId: completedSession._id,
      traineeId: traineeAir._id,
      traineeRoleId: 'air_controller',
      rubricVersion: '1.2.0',
      metricScores: {
        timeliness: 85,
        evidenceUse: 82,
        confidenceCalibration: 80,
        teamCoordination: 75,
        objectiveCompletion: 88,
      },
      totalScore: 82, // DRI
      explanations: {
        timelinessReason: 'Maintained air corridor readiness despite 25s delayed radar feed.',
        evidenceReason: 'Referenced verified radar contacts.',
        confidenceReason: 'Moderate confidence accurately aligned with sensor latency.',
        coordinationReason: 'Coordinated airspace picture with forward observers.',
        objectiveReason: 'Prevented friendly-fire incident against friendly surveillance UAV.',
      },
      instructorFeedback: 'Good restraint and patience waiting for visual confirmation.',
      recommendations: [
        'Confirm IFF cryptography status immediately upon radar lock.',
      ],
    },
  ]);

  // Seed AAR Report
  await AARReport.create({
    sessionId: completedSession._id,
    generatedBy: instructor._id,
    format: 'both',
    generatedAt: new Date(),
    status: 'ready',
    summary: {
      sessionCode: completedSession.sessionCode,
      exerciseDurationSec: 300,
      disruptionsCount: 3,
      teamDRI: 85,
    },
  });

  console.log(`[Seed] Completed Historical Session created: ${completedSession.sessionCode} (${completedSession._id})`);
  console.log('[Seed] Database seeding completed successfully.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => disconnectDB())
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
