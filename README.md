# SITU-AWARE: Immersive Multi-Domain Decision-Making Trainer for Degraded Communication Environments
### Smart India Hackathon — Problem Statement ID: SIH26248
**Organization:** Ministry of Defence, Government of India  
**Tagline:** *Train for uncertainty. Measure decision resilience.*

---

## 1. Executive Summary

In contested multi-domain military operations, real-time command feeds are vulnerable to electronic jamming, cyber spoofing, sensor dropouts, and conflicting intelligence. **SITU-AWARE** is an end-to-end, multiplayer web-based decision training platform built specifically to train and assess small military command teams under severe communication degradation.

The cornerstone differentiator of SITU-AWARE is the **Decision Resilience Engine**:
1. **Reconstructs Information State**: Determines exactly what intelligence was delivered, delayed, or dropped for each trainee at the exact millisecond a decision was committed.
2. **Authoritative Evidence Verification**: Validates whether cited intelligence was verified (actually visible to the operator) or unverified (assumed or cited after dropout/spoofing).
3. **Explainable Performance Assessment**: Uses a transparent, deterministic versioned rubric to calculate the **Decision Resilience Index (DRI)** (0–100), distinguishing reasonable decisions made with incomplete data from poor tactical choices.
4. **Official Exportable AAR**: Generates real, downloadable **PDF** and **CSV** reports containing complete timeline audits, disruption logs, and trainee rationales.

---

## 2. Key Capabilities & Problem Statement Compliance

| SIH26248 Requirement | Implementation in SITU-AWARE |
|-----------------------|------------------------------|
| **Multi-Domain Training** | Dedicated working synthetic feeds and interactive visualizers for all 4 domains: **Land** (Tactical Map), **Air** (PPI Radar with 360° sweep), **Cyber** (Defensive node topology), and **Electronic Warfare** (ESM spectrum waterfall & DF bearing). |
| **Degraded Communications Engine** | Live injection of all 3 mandatory disruption types: **Delays** (configurable latency), **Dropouts** (persisted failure audit), and **Conflicting Reports** (divergent sensor observations). |
| **Multiplayer Team Coordination** | Role-based feeds enforced on the backend via isolated Socket.IO channels. Trainees cannot see reports not delivered to them. Synchronized cross-domain radio chatter. |
| **Decision Resilience Engine** | Authoritative server clock (UTC), evidence verification against delivered history, and explainable DRI scoring (Timeliness 20%, Evidence Use 25%, Calibration 20%, Coordination 20%, Objectives 15%). |
| **Instructor Control Cockpit** | Full exercise lifecycle control (Start, Pause, Resume, Complete), live disruption injection modal, unvarnished global audit feed, and live decision monitor. |
| **Scenario Studio** | Visual scenario authoring suite to customize events, recipient permissions, disruption presets, and scoring rubric weights (with live sum = 1.0 validation). |
| **Synchronized AAR Replay** | Scrubbable timeline (T+0s to end) that reconstructs the exact information state visible to each trainee at any selected timestamp. |
| **Real PDF and CSV Exports** | Built-in **PDFKit** report generator with official Ministry of Defence header format and **fast-csv** structured audit logs. |

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, Axios, Socket.IO Client, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Socket.IO, MongoDB & Mongoose (with embedded in-memory fallback for 100% zero-configuration setup), Zod, bcryptjs, PDFKit, Fast-CSV.
- **Testing**: Vitest, Supertest (20 automated integration and E2E tests passing).

---

## 4. Default Seed Accounts (Quick-Switch in UI)

The platform comes pre-seeded with realistic fictional military accounts. Use the **Quick Switch Persona** dropdown in the top navbar to instantly change roles without typing credentials:

| Persona Name | Role | Email | Password | Assigned Domain |
|--------------|------|-------|----------|-----------------|
| **Col. Rajiv Sharma** | Instructor | `instructor@mod.gov.in` | `defence123` | Command & Control / Controller |
| **Major A. Verma** | Trainee | `land.trainee@mod.gov.in` | `defence123` | Land Domain Lead (`land_lead`) |
| **Sqn Ldr R. Sen** | Trainee | `air.trainee@mod.gov.in` | `defence123` | Joint Air Defense Controller (`air_controller`) |
| **Capt. K. Roy** | Trainee | `cyber.trainee@mod.gov.in` | `defence123` | Tactical Cyber Specialist (`cyber_officer`) |
| **Lt Cdr V. Rao** | Trainee | `ew.trainee@mod.gov.in` | `defence123` | Electronic Warfare Officer (`ew_officer`) |
| **HQ Administrator** | Admin | `admin@mod.gov.in` | `defence123` | User Administration & System Config |

---

## 5. End-to-End SIH26248 Demonstration Flow

### Step 1: Instructor Overview & Session Initialization
1. Navigate to `http://localhost:3000/login` and click **Col. Rajiv Sharma (Instructor)**.
2. In the **Dashboard**, inspect active sessions:
   - `SITU-1001`: Ready live multiplayer exercise.
   - `SITU-8800`: Completed historical exercise with full AAR and DRI assessments.
3. Click **Instructor Console** in the top navbar.

### Step 2: Trainees Join from Separate Browser Windows
1. Open a second browser window (or incognito) at `http://localhost:3000/lobby`.
2. Enter session code `SITU-1001` and select **Land Domain Lead**.
3. Open a third window, join as **Joint Air Defense Controller**.
4. Open a fourth window, join as **Tactical Cyber Specialist**.

### Step 3: Start Exercise & Experience Multi-Domain Feeds
1. In the **Instructor Console**, click **START EXERCISE**. The authoritative server timer begins advancing.
2. In the Trainee windows:
   - **Land Lead** sees ground recon reports and the interactive **Tactical Map**.
   - **Air Controller** views radar contacts on the live rotating **PPI Radar Display**.
   - **Cyber Ops** monitors the **Network Node Matrix** and packet loss telemetry.
   - **EW Officer** tracks the **Spectrum FFT Analyzer** and direction-finding bearing.

### Step 4: Inject Live Communication Disruptions
1. From the **Instructor Console**, click **INJECT DISRUPTION**.
2. Select **DELAY** (25s latency) for the Air Domain. Notice the Air feed indicator shows `+25s DELAY`.
3. Select **DROPOUT** for Cyber Domain targeting Land Lead. Report `EV-CYBER-02` is suppressed from the Land Lead's view and recorded in the audit log.
4. Select **CONFLICT** for Land Domain. The recon field report updates with contradictory pass accessibility data.

### Step 5: Team Coordination & Decision Commitment
1. Trainees transmit tactical observations using the **Tactical Comms Net** (e.g. cross-checking route clearance vs drone telemetry).
2. Trainees commit decisions in the **Tactical Decision Form**:
   - Select Checkpoint (e.g., `CP-ALPHA`).
   - Enter Action & Written Rationale.
   - Check supporting evidence items.
   - Set Confidence Slider (e.g. 75%).
   - Click **COMMIT TACTICAL DECISION**.
3. The Decision Resilience Engine evaluates the submission:
   - Green banner verifies delivered evidence.
   - Flags any unverified or hallucinated citations.

### Step 6: After-Action Review (AAR) & State Reconstruction
1. End the exercise or navigate to **AAR Replay** (`/aar`).
2. Drag the **Synchronized Timeline Slider** to any second (e.g., `T+55s`):
   - The left panel reconstructs exactly what reports had reached that trainee by that second, including suppressed dropouts.
   - The right panel shows the submitted decision, rationale, and verified vs unverified evidence.
3. Navigate to **Performance** (`/performance`) to inspect the **Decision Resilience Index (DRI)** radar chart, 5-metric breakdown, and training recommendations.
4. Navigate to **Reports** (`/reports`) and click **DOWNLOAD OFFICIAL PDF** or **DOWNLOAD AUDIT CSV** to obtain real exportable files.

---

## 6. Installation & Development Setup

### Prerequisites
- Node.js v18+ (tested on v22.14.0)
- npm v9+

### Quick Start
Clone the repository and install all dependencies:

```bash
# 1. Install root, server, and client dependencies
npm --prefix server install
npm --prefix client install

# 2. Run automated test suites (20 tests covering RBAC, scheduler, disruptions, DRI engine, PDF/CSV)
npm --prefix server test

# 3. Start development servers
# Terminal 1: Backend Server (Port 5000)
npm --prefix server run dev

# Terminal 2: Frontend Client (Port 3000)
npm --prefix client run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 7. Automated Test Coverage

The platform includes full automated integration and E2E test suites with **20 passing tests**:

```
✓ tests/e2e_journey.test.ts (8 tests)
  ✓ Step 1 & 2: Trainees join session with distinct operational roles
  ✓ Step 3: Instructor starts session authoritative simulation clock
  ✓ Step 4: Instructor injects delay, dropout, and conflicting disruptions
  ✓ Step 5: Trainees exchange cross-domain tactical communications
  ✓ Step 6: Trainees submit decisions evaluated against authoritative history
  ✓ Step 7: Instructor computes Decision Resilience Index (DRI) assessments
  ✓ Step 8: Instructor reconstructs trainee information state at decision time
  ✓ Step 9: Instructor downloads genuine official PDF and CSV reports

✓ tests/situaware.test.ts (12 tests)
  ✓ 1. Authentication and Role-Based Permissions (JWT, RBAC)
  ✓ 2. Scenario Creation and Validation (rubric weights sum to 1.0)
  ✓ 3. Session Lifecycle Transitions (Start, Pause, Resume, Complete)
  ✓ 4. Communication Degradation Engine (Delays, Dropouts, Conflicts)
  ✓ 5. Decision Resilience Engine & Evidence Verification
  ✓ 6. Exportable AAR Generation (PDFKit Binary Buffer & Fast-CSV)
```

Run tests at any time with:
```bash
npm --prefix server test
```

---

## 8. SIH26248 Problem Statement Compliance Summary

- **Multi-Domain Feeds**: 100% Implemented (Land, Air, Cyber, EW).
- **Communication Degradation**: 100% Implemented (Delay, Dropout, Conflicting Intel live injection).
- **Multiplayer Coordination**: 100% Implemented (Session codes, role isolation, real-time sync).
- **Decision Resilience Engine**: 100% Implemented (Information state reconstruction, evidence verification, explainable DRI scoring).
- **After-Action Review**: 100% Implemented (Synchronized scrubbable replay, real PDF and CSV downloads).

*SITU-AWARE was engineered for the Smart India Hackathon to provide an objective, data-driven, and transparent command training solution for the Ministry of Defence, Government of India.*
