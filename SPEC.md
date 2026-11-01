# AI Mystery Room — Technical Specification & Architecture (SPEC.md)

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Target Audience:** Full-stack developers, reviewers, portfolio evaluators  

---

## 1. Project Overview & Problem Statement

### 1.1 Overview
**AI Mystery Room** is a full-stack, AI-powered interactive detective game. Players step into the shoes of an investigative detective who must crack an original, procedurally generated fictional crime mystery. 

Unlike traditional puzzle games with fixed, hardcoded scripts or static multiple-choice branching, AI Mystery Room dynamically generates logically sound, unique mystery scenarios using Google's official Gemini AI SDK (`@google/genai`). Each case presents a rich narrative, suspect dossiers with distinct personalities, motives, and alibis, a discovery-based evidence board, progressive cryptic hints, and an accusation tribunal.

### 1.2 Problem Statement
Many "AI-powered" games suffer from critical architectural and design flaws:
1. **Hallucination & Logical Inconsistency:** Generative AI often produces unsolvable mysteries, contradictory timelines, duplicate entities, or ungrounded culprit accusations.
2. **Security Flaws & Solution Leaks:** Many web implementations send the full case solution (including culprit identity and explanation) directly to the client bundle or browser memory at case creation, allowing cheating via browser DevTools.
3. **Client-Side Trust Vulnerabilities:** Allowing the browser to report score calculations, clue counts, or verdict outcomes makes the game vulnerable to manipulation.
4. **Poor UI/UX Aesthetics:** AI demos frequently look like generic Bootstrap/admin dashboards rather than immersive, atmospheric narrative games.

AI Mystery Room addresses all these challenges through:
- **Strict Server-Side Validation:** Dual-layer Zod schema validation and semantic consistency algorithms with automated retries.
- **Zero-Trust Backend Security:** Complete isolation of the culprit identity and solution explanation on the backend until an accusation is submitted.
- **Backend-Driven State & Scoring:** Cryptographically secure anonymous case ownership tokens, backend score calculation, and tamper-proof state transitions.
- **Atmospheric Detective UI:** An elegant, dark-themed investigation room featuring charcoal, deep navy, and muted gold accents with evidence boards and suspect profiles.

---

## 2. Project Goals & Target Users

### 2.1 Project Goals
- **Educational Excellence:** Serve as a clean, idiomatic reference architecture for a full-stack TypeScript application integrating modern Generative AI, Express, React, and MongoDB.
- **High Replayability:** Support custom player premises alongside classic detective tropes (locked-room art heists, vintage train murders, confidential lab thefts, gothic manor letters).
- **Rock-Solid Security:** Guarantee that sensitive game solutions can never be inspected in client state, DOM, network tabs, or local storage prior to legitimate accusation.
- **Production Readiness:** Comprehensive automated test coverage, strict error handling, responsive mobile-friendly layouts, and complete deployment configuration.

### 2.2 Target Users
- **Casual Gamers & Puzzle Enthusiasts:** Players who enjoy whodunits, escape rooms, Agatha Christie novels, Sherlock Holmes stories, and deduction games.
- **Student Developers & Portfolio Reviewers:** Engineers seeking clean demonstrations of LLM prompt engineering, structured JSON generation, secure API design, and modern React patterns.

---

## 3. System Architecture & High-Level Design

```
+-----------------------------------------------------------------------------------+
|                                CLIENT BROWSER (Vite + React + TS)                 |
|  - Landing Page  - Case Creator  - Investigation Room  - Accusation  - Results     |
|  - Tailwind CSS  - Lucide Icons  - Axios Client (Token Header: x-case-token)      |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON
                                           v
+-----------------------------------------------------------------------------------+
|                               EXPRESS.JS BACKEND (Node.js + TS)                   |
|  [Security Middleware]: Helmet, CORS, Rate Limiter, Body Parser                   |
|  [Auth Middleware]: Case Token Hash Verification (SHA-256)                        |
|  [Route Controllers]: Cases, Clues, Hints, Accusations, Results, Health           |
|  [Service Layer]: MysteryGenerationService (Gemini), CaseService, ScoringEngine    |
|  [Serializers]: PublicCaseSerializer vs CompletedCaseResultSerializer             |
+---------------------+-------------------------------------+-----------------------+
                      |                                     |
                      v                                     v
+------------------------------------+    +-----------------------------------------+
|      GOOGLE GEMINI API (Official)  |    |         MONGODB / MONGOOSE              |
|  - Model: gemini-2.5-flash         |    |  - Cases Collection                     |
|  - Structured JSON Output          |    |  - Secret Fields Isolation              |
|  - System Prompt & Semantic Engine |    |  - Token Hash & State Persistence       |
+------------------------------------+    +-----------------------------------------+
```

---

## 4. Functional & Non-Functional Requirements

### 4.1 Functional Requirements
- **FR-01 Case Generation:** Generate an original mystery based on user-selected difficulty (`easy`, `medium`, `hard`), a premise (preset or custom), and an optional theme.
- **FR-02 Difficulty Scaling:**
  - **Easy:** 3 suspects, 5 clues, 2 hints, base score 100.
  - **Medium:** 4 suspects, 7 clues, 3 hints, base score 150.
  - **Hard:** 5 suspects, 9 clues, 3 hints, base score 200.
- **FR-03 Anonymous Ownership:** Issue a cryptographically secure random token (`caseToken`) upon creation; require this token in the `x-case-token` header for all mutating operations.
- **FR-04 Clue Discovery:** Players can click to uncover undiscovered clues one by one. Each discovery is recorded on the backend and awards +5 points. Repeated discovery attempts of the same clue are idempotent and award points only once.
- **FR-05 Progressive Hints:** Players can request hints in sequential order. Each hint costs a -10 point penalty. Players cannot exceed the difficulty's hint limit.
- **FR-06 Accusation & Verdict:** Players can select exactly one suspect and submit a final accusation. The backend verifies the accusation against the secret culprit, locks the case as `completed`, calculates the final score, and returns the verdict and explanation.
- **FR-07 Case Immutability:** Once a case is `completed`, clues cannot be discovered, hints cannot be requested, and accusations cannot be re-submitted.
- **FR-08 Result Review:** Players can inspect the full post-game analysis, evidence trail, score breakdown, and navigate back home or replay.

### 4.2 Non-Functional Requirements
- **NFR-01 Security & Data Confidentiality:** Under no circumstances may the culprit ID, solution explanation, or supporting evidence logic be transmitted to the frontend while `status === "active"`.
- **NFR-02 Resilient AI Generation:** Automatic retry mechanism (up to 3 attempts) if Gemini returns unparsable JSON or fails semantic validation.
- **NFR-03 Performance & Response Times:** Gemini generation completed within standard LLM latency (~3-8s) with visual loading state. Clue discovery, hint unlocks, and accusations respond in < 150ms.
- **NFR-04 Accessibility & Responsiveness:** Fully usable across mobile (320px+), tablet, and desktop (1920px+). Keyboard navigable, accessible ARIA labels, semantic HTML5 tags.
- **NFR-05 Code Quality:** 100% TypeScript across frontend and backend with strict typing, zero implicit `any`, and modular separation of concerns.

---

## 5. User Journey & Experience Flow

```
[ 1. LANDING PAGE ]
    |
    v
[ 2. CREATE CASE PAGE ]
    |-- Choose Preset or Enter Custom Premise
    |-- Choose Difficulty (Easy / Medium / Hard)
    |-- Choose Theme (Classic Noir, Cyberpunk, Victorian Manor, Lab Sci-Fi, Luxury Train)
    |-- Click "Generate Mystery"
    |
    v
[ 3. AI GENERATING SCREEN ] (Atmospheric spinner, case briefing cues, progress indicator)
    |
    v
[ 4. INVESTIGATION ROOM ]
    |-- Read Case Briefing & Story Introduction
    |-- Inspect Suspect Cards (name, role, alibi, motive)
    |-- Explore Evidence Board (locked vs unlocked clues)
    |-- Click "Inspect / Discover Clue" (+5 pts each)
    |-- Request Cryptic Hint if stuck (-10 pts each)
    |-- Click "Proceed to Accusation"
    |
    v
[ 5. ACCUSATION PANEL / MODAL ]
    |-- Review summary of discovered evidence
    |-- Select exactly 1 suspect
    |-- View warning: "Submitting an accusation permanently closes the investigation."
    |-- Confirm and Submit Accusation
    |
    v
[ 6. CASE RESOLUTION / RESULTS PAGE ]
    |-- Grand Verdict: "Case Solved!" vs "Case Cold / Wrong Accusation"
    |-- Reveal Actual Culprit vs Player's Accused Suspect
    |-- Score Breakdown: Base + (5 * Clues) - (10 * Hints)
    |-- Detailed Solution Narrative & Evidence Chain
    |-- "Investigate New Mystery" or "Return Home"
```

---

## 6. Frontend Pages & Component Specifications

### 6.1 Design System & Aesthetic Direction
- **Color Palette:**
  - Background Base: `#0B0F19` (Deep Obsidian / Midnight Noir)
  - Card & Surface Background: `#131B2E` (Dark Navy Charcoal)
  - Card Hover & Border: `#1F2E4D` (Steel Indigo)
  - Accent Gold: `#D4AF37` (Muted Metallic Gold / Vintage Brass)
  - Accent Gold Glow: `#F5D061`
  - Text Primary: `#F1F5F9` (Crisp Silver White)
  - Text Muted: `#94A3B8` (Slate Fog)
  - Success Verdict: `#10B981` (Emerald Green)
  - Failure/Warning Verdict: `#EF4444` (Crimson Alert)
- **Typography:**
  - Headings: Serif elegance (`Cinzel` or `Playfair Display` fallback to serif) for vintage noir detective prestige.
  - Body & UI: Sans-serif clarity (`Inter` or system sans-serif) for high legibility on dark backgrounds.
- **Icons:** `lucide-react` (MagnifyingGlass, ShieldAlert, Award, FileQuestion, Key, Sparkles, AlertTriangle, Fingerprint, RefreshCw, CheckCircle2, XCircle).

### 6.2 Pages & Key Components
1. **Home / Landing Page (`/`):**
   - `Navbar`: Brand badge, navigation links, GitHub/portfolio link.
   - `HeroSection`: Compelling title ("Step Into the Detective's Shoes"), atmospheric tagline, primary "Start Investigating" CTA.
   - `PremiseShowcase`: Interactive cards displaying the 5 signature case premises.
   - `HowToPlaySection`: 4-step deduction visual guide (Generate -> Inspect Suspects -> Uncover Clues -> Accuse).
   - `DifficultyPreview`: Visual comparison of Easy, Medium, and Hard investigation parameters.
   - `Footer`: Attribution, tech stack badges, copyright.

2. **Create Mystery Page (`/create`):**
   - `PremiseSelector`: Preset pill buttons for quick selection + customizable text area with real-time character counter (20 - 500 chars).
   - `ThemeSelector`: Optional aesthetic themes (Classic Noir, Victorian Gothic, High-Tech Heist, Train Murder Mystery).
   - `DifficultyCards`: 3 interactive selector cards with suspect, clue, and hint counts clearly enumerated.
   - `RandomPremiseButton`: Populates text area with a witty, randomly chosen case prompt.
   - `GenerateButton`: Displays active loading spinner with dynamic case-generation status messages.

3. **Investigation Room (`/case/:caseId`):**
   - `CaseHeader`: Case title, theme badge, difficulty badge, current live score indicator, and hints remaining count.
   - `StoryBriefing`: Narrative case introduction setting the scene and timeline.
   - `SuspectsGrid`: Cards showcasing each suspect's photo avatar/silhouette, name, profession, relation to victim, motive, and verified/claimed alibi.
   - `EvidenceBoard`: Grid of clue cards categorized by type (Physical, Forensics, Witness Statement, Digital, Document). Undiscovered clues display a sealed envelope / classified dossier look with an "Uncover Clue" button. Discovered clues reveal full title, description, and investigative relevance.
   - `HintPanel`: Accordion or sequential cards displaying revealed hints and a button to request next hint with explicit penalty warning (-10 pts).
   - `AccusationCTA`: Floating or pinned action bar displaying current investigation stats and a prominent "Make Your Accusation" button.

4. **Accusation Modal / Stage (`/case/:caseId/accuse` or overlay modal):**
   - Discovered evidence recap drawer.
   - Radio selection of suspects with clear portrait and name.
   - Critical confirmation warning modal before final POST submission.

5. **Results Page (`/case/:caseId/result`):**
   - Dramatic banner displaying verdict: **SOLVED** (Gold/Emerald) or **UNSOLVED / WRONGFULLY ACCUSED** (Crimson).
   - Culprit Reveal Dossier: Culprit identity, motive breakdown, and forensic explanation.
   - Player's Selection: Comparison between accused suspect and true culprit.
   - Score Summary Card:
     - Base Score (0 or 100 / 150 / 200)
     - Clue Discovery Bonus (+5 per clue discovered)
     - Hint Penalty (-10 per hint used)
     - **Final Calculated Score**
   - Chain of Evidence: Step-by-step reasoning linking discovered clues to the culprit's guilt.
   - Action buttons: "Investigate Another Mystery" and "Return to Home".

---

## 7. Backend Architecture & API Definitions

### 7.1 Architecture & Separation of Concerns
- **`src/app.ts`**: Express application configuration, middleware registration, rate limiting, route mounting, centralized error handling.
- **`src/server.ts`**: Server bootstrap, environment validation, database connection, graceful shutdown.
- **`src/controllers/caseController.ts`**: HTTP handlers, parameter parsing, delegating to services, response formatting.
- **`src/services/geminiService.ts`**: Google GenAI SDK client, system prompts, JSON generation, Zod parsing, semantic cross-checks, retry loops.
- **`src/services/caseService.ts`**: Business logic, MongoDB transactions/updates, clue discovery idempotency, hint progression, accusation scoring.
- **`src/middleware/authMiddleware.ts`**: Validates the `x-case-token` header against the SHA-256 hash stored in the database.
- **`src/serializers/caseSerializer.ts`**: 
  - `serializePublicCase()`: Strips `culpritId`, `solutionExplanation`, and `evidenceReasoning`.
  - `serializeCompletedCase()`: Includes the full solution once `status === "completed"`.

### 7.2 API Endpoints

#### 1. `POST /api/cases`
Creates and generates a new mystery case using Gemini.
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "premise": "A priceless diamond disappears from a locked museum room during a gala.",
    "difficulty": "medium",
    "theme": "Classic Noir"
  }
  ```
- **Validation:**
  - `premise`: string, min 10 chars, max 500 chars.
  - `difficulty`: enum `["easy", "medium", "hard"]`.
  - `theme`: optional string, max 100 chars.
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "caseToken": "c7a8b9e0f1d2...",
    "case": {
      "caseId": "CASE-984210",
      "title": "The Midnight Vault Illusion",
      "premise": "A priceless diamond disappears from a locked museum room during a gala.",
      "difficulty": "medium",
      "theme": "Classic Noir",
      "story": "At precisely 10:15 PM, the alarms of the Grand Lux Museum went silent...",
      "status": "active",
      "score": 0,
      "suspects": [
        {
          "id": "suspect-1",
          "name": "Julian Vance",
          "description": "Chief Curator with deep financial debts.",
          "motive": "Heavily leveraged in offshore art trading.",
          "alibi": "Claims he was delivering opening remarks in the ballroom."
        }
      ],
      "clues": [
        {
          "id": "clue-1",
          "title": "Bypassed Keypad",
          "description": "The electronic lock has no signs of forced entry.",
          "category": "Forensics",
          "discovered": false
        }
      ],
      "hints": [
        {
          "id": "hint-1",
          "text": "Examine the security log timestamps closely.",
          "order": 1,
          "revealed": false
        }
      ],
      "discoveredClueIds": [],
      "revealedHintCount": 0,
      "totalClues": 7,
      "totalHints": 3,
      "createdAt": "2026-10-29T15:00:00.000Z"
    }
  }
  ```

#### 2. `GET /api/cases/:id`
Retrieves the current state of an active mystery.
- **Headers:** `x-case-token: <caseToken>` (optional for read-only preview, but required for player session integrity).
- **Security Check:** Verifies case existence. Never returns culprit or solution fields.
- **Response (200 OK):** Public case object matching `serializePublicCase()`.

#### 3. `POST /api/cases/:id/clues/:clueId/discover`
Discovers a specific clue.
- **Headers:** `x-case-token: <caseToken>` (Required)
- **Behavior:**
  - Validates `case.status === "active"`.
  - Validates that `clueId` belongs to the case.
  - If already discovered: returns current state (idempotent, no duplicate points).
  - If not yet discovered: pushes `clueId` to `discoveredClueIds`, recalculates current provisional score (+5), saves to DB.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "discoveredClueId": "clue-1",
    "pointsAwarded": 5,
    "currentScore": 5,
    "case": { /* Updated Public Case State */ }
  }
  ```

#### 4. `POST /api/cases/:id/hints`
Requests the next available hint in sequence.
- **Headers:** `x-case-token: <caseToken>` (Required)
- **Behavior:**
  - Validates `case.status === "active"`.
  - Checks if `revealedHintCount < totalHints`. If no hints remain, returns `400 Bad Request`.
  - Increments `revealedHintCount`.
  - Records penalty (-10).
  - Returns newly unlocked hint and updated public case.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "hint": {
      "id": "hint-1",
      "text": "Examine the security log timestamps closely.",
      "order": 1
    },
    "hintsRemaining": 2,
    "penaltyDeducted": 10,
    "currentScore": -5,
    "case": { /* Updated Public Case State */ }
  }
  ```

#### 5. `POST /api/cases/:id/accuse`
Submits the player's final accusation.
- **Headers:** `x-case-token: <caseToken>` (Required)
- **Request Body:**
  ```json
  {
    "suspectId": "suspect-1"
  }
  ```
- **Behavior:**
  - Validates `case.status === "active"`. If already `completed`, returns `409 Conflict`.
  - Validates `suspectId` exists in `case.suspects`.
  - Compares `suspectId === case.secretSolution.culpritId`.
  - Calculates final score:
    - `isCorrect = (suspectId === case.secretSolution.culpritId)`
    - `base = isCorrect ? difficultyBaseScore : 0`
    - `clueBonus = case.discoveredClueIds.length * 5`
    - `hintPenalty = case.revealedHintCount * 10`
    - `finalScore = Math.max(0, base + clueBonus - hintPenalty)`
  - Updates `case.status = "completed"`, `case.selectedSuspectId = suspectId`, `case.isCorrect = isCorrect`, `case.finalScore = finalScore`.
  - Saves to MongoDB.
- **Response (200 OK):** Full completed case result including culprit and explanation.
  ```json
  {
    "success": true,
    "verdict": {
      "isCorrect": true,
      "accusedSuspectId": "suspect-1",
      "actualCulpritId": "suspect-1",
      "actualCulpritName": "Julian Vance",
      "baseScore": 150,
      "clueBonus": 25,
      "hintPenalty": 10,
      "finalScore": 165
    },
    "solution": {
      "explanation": "Julian Vance used his master override keycard 10 minutes prior to the gala...",
      "evidenceReasoning": [
        "Clue 1 proves the keypad was bypassed using an insider curator override.",
        "Clue 4 reveals Julian had access to the override ledger."
      ]
    }
  }
  ```

#### 6. `GET /api/cases/:id/result`
Retrieves the completed case verdict and explanation.
- **Headers:** `x-case-token: <caseToken>` (Required)
- **Security Check:** If `status !== "completed"`, returns `403 Forbidden` ("Investigation is still active. Accusation required to reveal the solution.").
- **Response (200 OK):** Same result structure as `POST /accuse`.

#### 7. `GET /api/health`
Health check endpoint reporting API uptime and database connectivity status.
- **Response (200 OK):** `{ "status": "ok", "database": "connected", "timestamp": "..." }`

---

## 8. Database Schema Design (MongoDB / Mongoose)

### 8.1 Schema Definition
Collection: `cases`
```typescript
interface ISuspect {
  id: string;               // e.g., "suspect-1"
  name: string;             // e.g., "Lord Reginald Harrington"
  description: string;      // Physical appearance, personality, role
  motive: string;           // Clear motive for the crime
  alibi: string;            // Stated whereabouts at time of crime
}

interface IClue {
  id: string;               // e.g., "clue-1"
  title: string;            // e.g., "Smudged Footprint"
  description: string;      // Detailed description of the evidence
  category: "Physical" | "Document" | "Forensics" | "Witness" | "Digital";
  significance: string;     // Internal investigative value
}

interface IHint {
  id: string;               // e.g., "hint-1"
  text: string;             // Cryptic guiding observation
  order: number;            // 1, 2, 3
}

interface ISecretSolution {
  culpritId: string;            // Must match one suspect.id
  explanation: string;          // Complete narrative unraveling the crime
  evidenceReasoning: string[];  // Step-by-step logic linking clues to culprit
}

interface ICaseDocument {
  caseId: string;               // Unique indexed identifier (e.g., "CASE-123456")
  caseTokenHash: string;        // SHA-256 hash of the client's secret access token
  title: string;
  premise: string;
  difficulty: "easy" | "medium" | "hard";
  theme: string;
  story: string;
  suspects: ISuspect[];
  clues: IClue[];
  hints: IHint[];
  secretSolution: ISecretSolution; // PROTECTED: excluded from default queries & public serializers
  discoveredClueIds: string[];  // Tracks clues uncovered by the player
  revealedHintCount: number;    // Tracks number of hints opened
  status: "active" | "completed";
  selectedSuspectId?: string;
  isCorrect?: boolean;
  finalScore?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 8.2 Indexes & Projection Rules
- **Indexes:**
  - `{ caseId: 1 }` (Unique)
  - `{ caseTokenHash: 1 }`
  - `{ createdAt: -1 }`
- **Mongoose Projection Rule:** In Mongoose schema options, `select: false` can be applied to `secretSolution` and `caseTokenHash` to prevent accidental inclusion during generic `.find()` or `.findOne()` queries. They are only explicitly selected when needed for authentication or final accusation resolution.

---

## 9. Gemini AI Integration & Prompt Engineering

### 9.1 SDK Usage
Using the official `@google/genai` library:
```typescript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

### 9.2 Mystery Generation Constraints
The prompt instructs Gemini to output strict JSON conforming to this specification:
1. **Solvability & Consistency:** Exactly one suspect is the culprit. The clues must provide sufficient logical deduction (timeline conflict, physical contradiction, or fabricated alibi) to pinpoint the culprit without guesswork.
2. **Fair Red Herrings:** Innocent suspects must have reasonable motives or suspicious behavior that can be conclusively cleared by investigating the clues.
3. **Array Quantities by Difficulty:**
   - Easy: 3 suspects, 5 clues, 2 hints.
   - Medium: 4 suspects, 7 clues, 3 hints.
   - Hard: 5 suspects, 9 clues, 3 hints.
4. **Referential Integrity:**
   - Suspect IDs: `suspect-1`, `suspect-2`, ...
   - Clue IDs: `clue-1`, `clue-2`, ...
   - Hint IDs: `hint-1`, `hint-2`, ...
   - `secretSolution.culpritId` must be strictly equal to one of the suspect IDs.
   - `secretSolution.evidenceReasoning` must explicitly reference the clue IDs that prove the case.

### 9.3 Output Validation & Semantic Checks
- **Stage 1 (Syntax):** Parse raw response into JSON. Strip any markdown fences (` ```json `).
- **Stage 2 (Zod Schema Validation):** Validate all property types, array lengths, string limits.
- **Stage 3 (Semantic Cross-Checks):**
  - Verify `culpritId` exists in `suspects`.
  - Verify every `suspect.id`, `clue.id`, `hint.id` is distinct (no duplicates).
  - Verify hint count and clue count exactly equal the expected configuration for the chosen difficulty.
  - Verify culprit name matches the suspect with `culpritId`.
- **Stage 4 (Retry Policy):** If any stage fails, log warning and retry generation up to 3 times before returning a descriptive user-facing error.

---

## 10. Scoring Rules & Mechanics

### 10.1 Formula
$$\text{Final Score} = \max\left(0, \text{Base Score} + (5 \times \text{Unique Clues Discovered}) - (10 \times \text{Hints Used})\right)$$

### 10.2 Parameters
| Difficulty | Suspects | Clues | Hints | Correct Accusation Base | Clue Bonus | Hint Penalty | Min Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Easy** | 3 | 5 | 2 | 100 | +5 / clue | -10 / hint | 0 |
| **Medium** | 4 | 7 | 3 | 150 | +5 / clue | -10 / hint | 0 |
| **Hard** | 5 | 9 | 3 | 200 | +5 / clue | -10 / hint | 0 |

- If the accusation is **incorrect**: Base Score = 0. Clue bonuses and hint penalties still apply, with a hard floor at 0 points.
- **Idempotency:** Discovering the same clue multiple times does not increase the score.
- **Backend Enforced:** The client never computes or transmits the score. The backend calculates the score from database records.

---

## 11. Security & Privacy Architecture

### 11.1 Principle of Least Privilege / Zero-Knowledge Frontend
1. **No Early Leaks:** The backend schema separates public data from secret data. The `secretSolution` object is never sent across the network until `status === "completed"`.
2. **No CSS Hiding:** Clues are not hidden with `display: none` in CSS. Undiscovered clues have their descriptions withheld or redacted until the player clicks discover.
3. **No Client Trust:** Score, clue lists, and verdicts are never trusted from HTTP payloads.

### 11.2 Anonymous Case Authorization (Token Header)
Since players can play without logging into a user account:
- Upon case creation, the server generates a 32-byte cryptographically secure random token (`crypto.randomBytes(32).toString('hex')`).
- The server stores the **SHA-256 hash** of this token in MongoDB (`caseTokenHash`).
- The unhashed token is returned once to the client in the `POST /api/cases` response.
- The client stores this token in browser memory / `sessionStorage` and includes it in subsequent requests via the `x-case-token` header.
- The server verifies: `crypto.createHash('sha256').update(token).digest('hex') === case.caseTokenHash`.
- This prevents brute-force enumeration of sequential case IDs or tampering by other players.

### 11.3 Rate Limiting & Input Sanitization
- `express-rate-limit` prevents spamming of AI generation endpoints (e.g., max 10 case generations per 15 minutes per IP).
- Request payloads validated strictly with Zod.
- CORS restricted to configured `CLIENT_URL`.
- Sensitive environment variables are kept on the server and excluded from version control.

---

## 12. Error Handling & Loading States

### 12.1 Error Handling Matrix
| Scenario | HTTP Status | User-Facing Message | UI Behavior |
| :--- | :---: | :--- | :--- |
| Case not found | 404 | "Case file could not be found or has expired." | Display case not found banner with "Create New Case" button |
| Invalid Case Token | 401 | "Unauthorized access to this investigation." | Redirect to Home with security notice |
| Accusation on closed case | 409 | "This investigation is already closed." | Show notification and redirect to results page |
| No hints remaining | 400 | "All available hints have already been deciphered." | Disable hint button, show warning badge |
| AI Generation Failure | 502 / 503 | "The detective agency is experiencing delays analyzing the crime scene. Please retry." | Display retry CTA without losing user premise |
| Network Disconnection | Client Error | "Connection interrupted. Reconnecting..." | Non-intrusive offline banner with auto-retry |

---

## 13. Testing Strategy

### 13.1 Backend Tests (`server/tests`)
- **Unit & Service Tests:**
  - Mystery generation semantic validation (reject invalid counts, duplicate IDs, missing culprit).
  - Scoring engine calculations (correct/incorrect verdicts, zero floor, clue bonuses, hint penalties).
  - Token hashing and authorization verification.
- **API Integration Tests (Supertest):**
  - `POST /api/cases`: generates case, verifies public serializer (ensures NO culprit or solution in JSON).
  - `POST /api/cases/:id/clues/:clueId/discover`: verifies +5 score, verifies idempotency.
  - `POST /api/cases/:id/hints`: verifies -10 score, respects max hints limit.
  - `POST /api/cases/:id/accuse`: handles correct and incorrect verdicts, verifies status locks to `completed`.
  - `GET /api/cases/:id/result`: verifies 403 on active cases, 200 on completed cases.
  - Security test: explicitly verifies that brute-forcing without `x-case-token` fails.

### 13.2 Frontend Tests (`client/src`)
- Vitest + React Testing Library:
  - Form validation on Create Mystery page (character limits, difficulty selection).
  - Rendering Investigation Room components (Suspect cards, Clue board).
  - Accusation flow and confirmation modal.
  - Result view rendering score breakdown and solution narrative.

---

## 14. Deployment Strategy & Environment Variables

### 14.1 Backend Environment Variables (`server/.env.example`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/ai-mystery-room?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 14.2 Frontend Environment Variables (`client/.env.example`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 14.3 Deployment Platforms
- **Frontend:** Vercel / Netlify (Build command: `npm run build`, Output directory: `dist`).
- **Backend:** Render / Railway / Fly.io (Build command: `npm run build`, Start command: `npm start`).
- **Database:** MongoDB Atlas (M0 Free Tier or higher).

---

## 15. Implementation Phases & Checklist

- [x] **Phase 1: Specification & Architecture**
  - [x] Workspace inspection.
  - [x] Comprehensive `SPEC.md` creation and review.
- [x] **Phase 2: Backend Development**
  - [x] Initialize Node.js + Express + TypeScript project in `server/`.
  - [x] Configure `dotenv`, `cors`, `helmet`, `express-rate-limit`.
  - [x] Setup MongoDB connection with Mongoose.
  - [x] Create Mongoose models (`Case`).
  - [x] Implement Gemini AI mystery generator service with Zod schema validation & semantic verification.
  - [x] Implement token generation, hashing, and authorization middleware.
  - [x] Implement public and completed case serializers.
  - [x] Implement controllers and routes for all 6 endpoints + health check.
  - [x] Write and run automated backend tests (Supertest + mocked Gemini).
- [x] **Phase 3: Frontend Development**
  - [x] Initialize React + Vite + TypeScript in `client/`.
  - [x] Configure Tailwind CSS with custom noir/gold palette and typography.
  - [x] Setup React Router and Axios API service client with token interceptor.
  - [x] Build Landing / Home Page with hero, rules, and premise cards.
  - [x] Build Create Mystery Page with interactive presets, theme selector, and difficulty cards.
  - [x] Build Investigation Room with Suspect dossiers, Evidence board, and Hint panel.
  - [x] Build Accusation Tribunal modal with confirmation safeguards.
  - [x] Build Results Page with verdict banner, culprit reveal, and score breakdown.
  - [x] Add loading skeletons, dynamic AI status messages, and error banners.
  - [x] Write and run frontend component tests.
- [ ] **Phase 4: Full-Stack Integration & Verification**
  - [ ] Connect client to server.
  - [ ] Verify full end-to-end gameplay loop across all difficulties.
  - [ ] Verify security guarantees: verify network payloads contain zero solution leaks.
  - [ ] Verify mobile responsiveness.
- [ ] **Phase 5: Documentation & Deployment Preparation**
  - [ ] Write complete `README.md` with architecture, setup, environment, and deployment guides.
  - [ ] Final acceptance criteria audit.

---

## 16. Acceptance Criteria

1. `SPEC.md` exists, is comprehensive, and guides all implementation steps.
2. Server boots cleanly, verifies environment variables, and exposes `/api/health`.
3. Generating a case with Gemini produces structured, semantically validated cases adhering to exact difficulty quotas:
   - Easy: 3 suspects, 5 clues, 2 hints.
   - Medium: 4 suspects, 7 clues, 3 hints.
   - Hard: 5 suspects, 9 clues, 3 hints.
4. Active case retrieval never exposes `culpritId`, `explanation`, or `evidenceReasoning`.
5. Clue discovery is idempotent, persisted, and accurately updates provisional score (+5).
6. Hints are progressive, capped by difficulty, and apply the penalty (-10).
7. Accusation requires an active case and valid suspect, calculates verdict and final score using the documented formula, and persists the result.
8. Completed case results are permanently sealed and verifiable via `GET /api/cases/:id/result`.
9. Zero-trust security prevents client-side score injection or solution tampering.
10. Automated tests pass for all business logic, security constraints, and UI flows.
11. UI is visually stunning, responsive, and matches the atmospheric noir detective theme.
