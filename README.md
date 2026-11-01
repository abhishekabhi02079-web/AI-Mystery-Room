# 🕵️ AI Mystery Room — Full-Stack AI Detective Game

An atmospheric, interactive AI-powered detective deduction game. Players step into the shoes of a lead investigator, commission procedurally generated crime mysteries, interrogate suspects with unique alibis and motives, uncover forensic evidence cards, decipher progressive cryptic hints, and render an irreversible final accusation.

Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB Atlas**, and Google's official **Gemini GenAI SDK (`@google/genai`)**.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Security: Zero-Leak Guarantee](#-security-zero-leak-guarantee)
3. [Game Rules & Scoring Engine](#-game-rules--scoring-engine)
4. [Architecture & System Flow](#-architecture--system-flow)
5. [Tech Stack](#-tech-stack)
6. [Getting Started (Local Development)](#-getting-started-local-development)
7. [Environment Variables](#-environment-variables)
8. [Automated Testing](#-automated-testing)
9. [API Endpoints Reference](#-api-endpoints-reference)
10. [Deployment Guide](#-deployment-guide)
11. [Educational Takeaways for Students](#-educational-takeaways-for-students)

---

## 🌟 Key Features

- **Dynamic AI Mystery Generation:** Uses Google Gemini (`gemini-2.5-flash`) via the official `@google/genai` SDK to generate original, logically sound, and solvable whodunits.
- **Dynamic Difficulty Quotas:**
  - **Easy:** 3 suspects, 5 clues, 2 hints, base 100 points.
  - **Medium:** 4 suspects, 7 clues, 3 hints, base 150 points.
  - **Hard:** 5 suspects, 9 clues, 3 hints, base 200 points.
- **Signature Crime Tropes & Custom Premises:** Supports iconic mystery tropes (locked museum vault, gothic manor letter, private party heist, confidential lab breach, alpine express train) or any custom prompt entered by the player.
- **Interactive Evidence Board:** Sealed evidence files that can be examined one by one for forensic details, digital logs, physical prints, and witness statements (+5 bonus points each).
- **Progressive Cryptic Hints:** Layered hints to guide deduction when the case grows cold (-10 penalty each).
- **The Accusation Tribunal:** High-stakes suspect selection with evidence recap and irreversible confirmation safeguards.
- **Forensic Post-Mortem:** After the accusation, the system unmasks the true culprit, compares them to the accused suspect, displays a verified score breakdown, and reveals the chain of reasoning.
- **Atmospheric Noir Aesthetic:** Styled in deep obsidian (`#0B0F19`), dark navy charcoal, and muted vintage gold (`#D4AF37`) with tailored typography (Cinzel & Inter) and responsive layouts.
- **Persistent Case Dossier:** Active and completed investigations are stored in the configured MongoDB instance and listed in the Cases Dossier. The server fails to start if MongoDB is unavailable rather than silently using temporary storage.
- **Procedural Mystery Generation:** If no Gemini API key is configured, mystery generation falls back to procedural case templates.

---

## 🛡️ Security: Zero-Leak Guarantee

A core design requirement of AI Mystery Room is **tamper-proof secret isolation**:

1. **No Early Leaks in Payloads:** During active investigations (`status: "active"`), the server serializes case data using `serializePublicCase()`. The true culprit identity (`culpritId`), solution narrative (`explanation`), and evidence chain (`evidenceReasoning`) are completely excluded from database queries and network responses.
2. **No Client-Side Cheating:** Secrets are never sent to the browser DOM, JavaScript state, local storage, or HTML comments. Inspecting the browser's Network tab or Redux/React devtools reveals zero solution data.
3. **Cryptographically Secure Anonymous Tokens:** Upon case creation, the server issues a 64-character random token (`caseToken`). The database stores only the **SHA-256 hash** (`caseTokenHash`). Mutating actions (discovering clues, requesting hints, accusing) require the `x-case-token` header.
4. **Zero-Trust Backend Scoring:** The frontend cannot submit a score, clue count, or verdict. All scoring and state changes are computed and recorded strictly on the server.
5. **Idempotency & One-Way Transitions:** Discovered clues cannot award duplicate points, and once an accusation is submitted, the case is sealed (`status: "completed"`). Repeated accusations return `409 Conflict`.

---

## ⚖️ Game Rules & Scoring Engine

### Scoring Formula
$$\text{Final Score} = \max\left(0, \text{Base Score} + (5 \times \text{Unique Clues Discovered}) - (10 \times \text{Hints Used})\right)$$

### Parameter Matrix
| Difficulty | Suspects | Clues | Hints | Correct Accusation Base | Clue Bonus | Hint Penalty | Minimum Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Easy** | 3 | 5 | 2 | **100 pts** | +5 pts / clue | -10 pts / hint | 0 pts |
| **Medium** | 4 | 7 | 3 | **150 pts** | +5 pts / clue | -10 pts / hint | 0 pts |
| **Hard** | 5 | 9 | 3 | **200 pts** | +5 pts / clue | -10 pts / hint | 0 pts |

> **Note:** If the accusation is incorrect, the base score is **0**. Clue bonuses and hint penalties still apply, with a hard floor at zero.

---

## 🏗️ Architecture & System Flow

```
[ User Browser (React + Vite) ]
          |
          | HTTP Requests (with x-case-token header)
          v
[ Express.js Backend (Node.js + TS) ]
    |-- [Helmet / CORS / Rate Limiting Middleware]
    |-- [Case Auth Middleware] (SHA-256 Token Verification)
    |-- [Controllers & Validators] (Zod Request Validation)
    |-- [Case Service] (State Transitions & Idempotent Logic)
    |-- [Scoring Engine] (Backend-Enforced Verification)
    |-- [Gemini Service] <---> [Google Gemini API (@google/genai)]
    |       |-- Structured JSON Output
    |       |-- Zod Schema Validation
    |       |-- Semantic Cross-Checks & Auto-Retries
    |-- [Mongoose Models] <---> [MongoDB Atlas / Local DB]
            (Secret fields isolated via select: false)
```

---

## 💻 Tech Stack

### Frontend (`client/`)
- **React 18** with **TypeScript**
- **Vite** for rapid bundling and development
- **Tailwind CSS** with custom dark noir palette and gold glow styling
- **React Router v6** for client-side navigation
- **Axios** with automatic token interceptors
- **Lucide React** for atmospheric detective icons
- **Vitest & React Testing Library** for component testing

### Backend (`server/`)
- **Node.js** (v20+) with **Express.js** and **TypeScript**
- **Google GenAI SDK (`@google/genai`)** for structured LLM synthesis
- **MongoDB Atlas** with **Mongoose** (schema-level protection)
- **Zod** for request validation and AI output validation
- **Helmet, CORS & express-rate-limit** for API security
- **Supertest & Vitest** for automated integration and security testing

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** (v20 or higher recommended)
- **npm** (v10 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-mystery-room.git
cd ai-mystery-room
```

### 2. Install Dependencies
Install all workspace dependencies using the root helper script:
```bash
npm run install:all
```
*(Or install manually inside `server/` and `client/`: `npm install`)*

### 3. Setup Environment Variables
Create `.env` files in both `server/` and `client/`:

**`server/.env`**:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Required: persistent MongoDB instance (local MongoDB or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/ai-mystery-room

# Optional for local procedural generation; required for AI generation in production.
# Obtain your key at https://aistudio.google.com/ and store it only in server environment settings.
# If omitted, high-fidelity procedural mysteries will be generated for offline testing.
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

**`client/.env`**:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Vite dev server starts on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser to start playing!

---

## 🧪 Automated Testing

Both the backend and frontend include automated test suites covering business logic, AI schema validation, security guarantees, and UI components.

### Run All Tests
```bash
npm test
```

### Run Server Tests Individually
```bash
npm run test:server
```
Covers:
- `scoring.test.ts`: Base scoring, clue bonuses, hint penalties, zero floor.
- `geminiValidation.test.ts`: Semantic entity validation, duplicate ID rejection, difficulty quota verification.
- `securityAndSerialization.test.ts`: **Zero-leak proof** confirming active cases never expose culprit or secret solution.
- `caseApi.test.ts`: Supertest API tests for case generation, clue discovery, hint progression, token authorization, and accusation resolution.

### Run Client Tests Individually
```bash
npm run test:client
```
Covers:
- `components.test.tsx`: Suspect card dossiers, sealed vs examined clue cards, score card mathematics, and error banner handlers.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | None | Reports API health and database connection status |
| `POST` | `/api/cases` | Rate Limited | Generates a new mystery with Gemini, returns public case + `caseToken` |
| `GET` | `/api/cases` | None | Lists persisted active and completed dossier summaries (solution excluded) |
| `GET` | `/api/cases/:id` | None / Public | Retrieves active case public state (solution excluded) |
| `POST` | `/api/cases/:id/clues/:clueId/discover` | `x-case-token` | Uncovers sealed clue, awards +5 pts (Idempotent) |
| `POST` | `/api/cases/:id/hints` | `x-case-token` | Unlocks next progressive hint, deducts 10 pts |
| `POST` | `/api/cases/:id/accuse` | `x-case-token` | Submits final accusation, computes verdict, locks case |
| `GET` | `/api/cases/:id/result` | `x-case-token` | Retrieves full post-game solution and score breakdown (403 if active) |

---

## 🌐 Deployment Guide

### 1. Deploying the Frontend (Vercel)
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import the repository and set:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://your-backend-api.onrender.com/api
   ```
5. Click **Deploy**. SPA route rewrites are pre-configured in `client/vercel.json`.

### 2. Deploying the Backend (Render / Railway / Fly.io)
1. Create a new **Web Service** on [Render](https://render.com/) or [Railway](https://railway.app/).
2. Connect your repository and configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. In **Environment Variables**, add:
   ```env
   NODE_ENV=production
   CLIENT_URL=https://your-frontend.vercel.app
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/ai-mystery-room?retryWrites=true&w=majority
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-3.8-flash
   ```
   The hosting provider supplies `PORT`; the server binds to `0.0.0.0`.
4. Deploy the service. Set the frontend's `VITE_API_BASE_URL` to `https://your-backend-api.onrender.com/api` and rebuild/redeploy the frontend.

### 3. Setting Up MongoDB Atlas
1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user with read/write privileges.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so your cloud backend can connect.
4. Copy the connection string into your backend's `MONGODB_URI`.

---

## 🎓 Educational Takeaways for Students

1. **Structured Outputs with LLMs:** Demonstrates how to guide modern generative models to output pure, schema-validated JSON with strict quantity constraints rather than unpredictable prose.
2. **Dual-Layer Validation:** Syntax parsing is not enough for games; this project shows how to pair Zod validation with custom **semantic checks** (e.g. verifying that the culprit ID actually exists in the generated suspect list).
3. **Defense-in-Depth Web Security:** Shows why sensitive game solutions should never be stored in frontend state and illustrates how to use SHA-256 token hashing for anonymous player authorization.
4. **Idempotent API Design:** Demonstrates how actions like clue discovery can be safely repeated without creating duplicate records or awarding excess points.
5. **Modern Full-Stack TypeScript:** End-to-end type safety connecting React frontend components to Express controllers, services, and Mongoose models.

---

## 📜 License
This project is open-source and available under the **MIT License**.
