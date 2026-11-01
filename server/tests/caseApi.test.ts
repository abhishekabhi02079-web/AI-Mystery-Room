import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Case } from '../src/models/Case.js';

describe('Case API Endpoints Integration Tests (Supertest)', () => {
  let mongoServer: MongoMemoryServer;
  let app: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDB(uri);
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
  });

  it('GET /api/health returns 200 and connected database status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });

  it('allows configured frontend origins and omits CORS access for unknown origins', async () => {
    const allowedOrigin = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(allowedOrigin.headers['access-control-allow-origin']).toBe('http://localhost:5173');

    const unknownOrigin = await request(app)
      .get('/api/health')
      .set('Origin', 'https://unconfigured.example');
    expect(unknownOrigin.headers['access-control-allow-origin']).toBeUndefined();
  });

  let createdCaseId: string;
  let createdCaseToken: string;
  let suspectsList: any[];
  let cluesList: any[];

  it('POST /api/cases generates a new mystery and returns token + public case', async () => {
    const res = await request(app)
      .post('/api/cases')
      .send({
        premise: 'A priceless sapphire vanishes from the Victorian gallery vault.',
        difficulty: 'easy',
        theme: 'Victorian Noir',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.caseToken).toBeDefined();
    expect(res.body.case).toBeDefined();
    expect(res.body.case.difficulty).toBe('easy');
    expect(res.body.case.suspects).toHaveLength(3);
    expect(res.body.case.clues).toHaveLength(5);
    expect(res.body.case.hints).toHaveLength(2);

    createdCaseId = res.body.case.caseId;
    createdCaseToken = res.body.caseToken;
    suspectsList = res.body.case.suspects;
    cluesList = res.body.case.clues;

    const storedCase = await Case.findOne({ caseId: createdCaseId });
    expect(storedCase).toBeDefined();
    expect(storedCase?.status).toBe('active');
    expect(storedCase?.discoveredClueIds).toEqual([]);
    expect(storedCase?.revealedHintCount).toBe(0);

    // MANDATORY SECURITY TEST: Culprit and solution MUST NEVER be present
    expect(res.body.case.secretSolution).toBeUndefined();
    expect(res.body.case.culpritId).toBeUndefined();
    expect(res.body.case.culpritName).toBeUndefined();
    expect(res.body.case.explanation).toBeUndefined();
    expect(res.body.case.caseTokenHash).toBeUndefined();
  });

  it('GET /api/cases/:id returns active case and verifies zero-leak guarantee', async () => {
    const res = await request(app).get(`/api/cases/${createdCaseId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.case.caseId).toBe(createdCaseId);

    // Verify all secret fields are absent
    expect(res.body.case.secretSolution).toBeUndefined();
    expect(res.body.case.culpritId).toBeUndefined();
    expect(res.body.case.culpritName).toBeUndefined();
    expect(res.body.case.explanation).toBeUndefined();
    expect(res.body.case.caseTokenHash).toBeUndefined();
  });

  it('GET /api/cases lists persisted active cases for the dossier', async () => {
    const res = await request(app).get('/api/cases');

    expect(res.status).toBe(200);
    const savedCase = res.body.cases.find((entry: any) => entry.caseId === createdCaseId);
    expect(savedCase).toMatchObject({
      caseId: createdCaseId,
      status: 'active',
      discoveredClueCount: 0,
      revealedHintCount: 0,
      finalScore: null,
    });
    expect(savedCase.secretSolution).toBeUndefined();
  });

  it('Protected actions reject requests without x-case-token (401 Unauthorized)', async () => {
    const res = await request(app).post(`/api/cases/${createdCaseId}/hints`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Missing Authorization Token');
  });

  it('Protected actions reject requests with forged x-case-token (401 Unauthorized)', async () => {
    const res = await request(app)
      .post(`/api/cases/${createdCaseId}/hints`)
      .set('x-case-token', 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid Case Token');
  });

  it('POST /api/cases/:id/clues/:clueId/discover unlocks clue and awards +5 points', async () => {
    const targetClueId = cluesList[0].id;

    const res = await request(app)
      .post(`/api/cases/${createdCaseId}/clues/${targetClueId}/discover`)
      .set('x-case-token', createdCaseToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.discoveredClueId).toBe(targetClueId);
    expect(res.body.pointsAwarded).toBe(5);
    expect(res.body.currentScore).toBe(5);
  });

  it('POST /api/cases/:id/clues/:clueId/discover is IDEMPOTENT (no duplicate points)', async () => {
    const targetClueId = cluesList[0].id; // Same clue as previous test

    const res = await request(app)
      .post(`/api/cases/${createdCaseId}/clues/${targetClueId}/discover`)
      .set('x-case-token', createdCaseToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pointsAwarded).toBe(0); // 0 additional points
    expect(res.body.currentScore).toBe(5); // Still 5 points
  });

  it('POST /api/cases/:id/hints unlocks progressive hint and deducts 10 points', async () => {
    const res = await request(app)
      .post(`/api/cases/${createdCaseId}/hints`)
      .set('x-case-token', createdCaseToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.hint.order).toBe(1);
    expect(res.body.penaltyDeducted).toBe(10);
    expect(res.body.hintsRemaining).toBe(1); // Easy has 2 hints total, 1 remaining
    expect(res.body.currentScore).toBe(-5); // 5 clue bonus - 10 hint penalty = -5 provisional

    const storedProgress = await Case.findOne({ caseId: createdCaseId });
    expect(storedProgress?.discoveredClueIds).toContain(cluesList[0].id);
    expect(storedProgress?.revealedHintCount).toBe(1);
  });

  it('GET /api/cases/:id/result returns 403 Forbidden on active cases', async () => {
    const res = await request(app)
      .get(`/api/cases/${createdCaseId}/result`)
      .set('x-case-token', createdCaseToken);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('active');
  });

  it('POST /api/cases/:id/accuse submits accusation, computes verdict, and locks case', async () => {
    const accusedSuspect = suspectsList[0];

    const res = await request(app)
      .post(`/api/cases/${createdCaseId}/accuse`)
      .set('x-case-token', createdCaseToken)
      .send({ suspectId: accusedSuspect.id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('completed');
    expect(res.body.verdict).toBeDefined();
    expect(res.body.verdict.accusedSuspectId).toBe(accusedSuspect.id);
    expect(res.body.verdict.actualCulpritId).toBeDefined();
    expect(res.body.solution).toBeDefined();
    expect(res.body.solution.explanation).toBeDefined();
    expect(res.body.solution.evidenceReasoning.length).toBeGreaterThan(0);
  });

  it('POST /api/cases/:id/accuse rejects repeated accusations with 409 Conflict', async () => {
    const res = await request(app)
      .post(`/api/cases/${createdCaseId}/accuse`)
      .set('x-case-token', createdCaseToken)
      .send({ suspectId: suspectsList[1].id });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already been rendered');
  });

  it('GET /api/cases/:id/result returns final verdict and explanation after completion', async () => {
    const res = await request(app)
      .get(`/api/cases/${createdCaseId}/result`)
      .set('x-case-token', createdCaseToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('completed');
    expect(res.body.verdict.finalScore).toBeGreaterThanOrEqual(0);
    expect(res.body.solution.explanation).toBeDefined();

    // Verify direct database persistence of case completion & finalScore
    const dbDoc = await Case.findOne({ caseId: createdCaseId }).select('+secretSolution');
    expect(dbDoc).toBeDefined();
    expect(dbDoc?.status).toBe('completed');
    expect(dbDoc?.finalScore).toBe(res.body.verdict.finalScore);
    expect(dbDoc?.selectedSuspectId).toBe(res.body.verdict.accusedSuspectId);
    expect(dbDoc?.isCorrect).toBe(res.body.verdict.isCorrect);
    expect(dbDoc?.discoveredClueIds).toContain(cluesList[0].id);
    expect(dbDoc?.revealedHintCount).toBe(1);
    expect(dbDoc?.secretSolution.culpritId).toBe(res.body.verdict.actualCulpritId);
    expect(await Case.countDocuments({ caseId: createdCaseId })).toBe(1);
  });

  it('GET /api/cases lists saved active and completed dossiers without leaking solutions', async () => {
    const res = await request(app).get('/api/cases');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.cases)).toBe(true);
    const savedCase = res.body.cases.find((entry: any) => entry.caseId === createdCaseId);

    expect(savedCase).toMatchObject({
      caseId: createdCaseId,
      status: 'completed',
      discoveredClueCount: 1,
      revealedHintCount: 1,
      finalScore: expect.any(Number),
      selectedSuspectName: expect.any(String),
      isCorrect: expect.any(Boolean),
    });
    expect(savedCase.secretSolution).toBeUndefined();
    expect(savedCase.actualCulpritName).toBeUndefined();

  });

  it('Rejects clue discovery on a completed case with 400 Bad Request', async () => {
    const res = await request(app)
      .post(`/api/cases/${createdCaseId}/clues/${cluesList[1].id}/discover`)
      .set('x-case-token', createdCaseToken);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('investigation is already closed');
  });

  it('Rejects hint request on a completed case with 400 Bad Request', async () => {
    const res = await request(app)
      .post(`/api/cases/${createdCaseId}/hints`)
      .set('x-case-token', createdCaseToken);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('investigation is already closed');
  });

  it('Rejects non-existent clue discovery with 404', async () => {
    // Create an active case to test non-existent clue
    const newCaseRes = await request(app)
      .post('/api/cases')
      .send({ difficulty: 'easy', premise: 'Test active case for non-existent clue.' });
    const activeCaseId = newCaseRes.body.case.caseId;
    const activeToken = newCaseRes.body.caseToken;

    const res = await request(app)
      .post(`/api/cases/${activeCaseId}/clues/non-existent-clue-999/discover`)
      .set('x-case-token', activeToken);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('does not exist in this case');
  });

  it('Rejects accusation with non-existent suspect ID with 400', async () => {
    const newCaseRes = await request(app)
      .post('/api/cases')
      .send({ difficulty: 'easy', premise: 'Test active case for invalid suspect.' });
    const activeCaseId = newCaseRes.body.case.caseId;
    const activeToken = newCaseRes.body.caseToken;

    const res = await request(app)
      .post(`/api/cases/${activeCaseId}/accuse`)
      .set('x-case-token', activeToken)
      .send({ suspectId: 'suspect-imaginary-99' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('does not exist in this investigation');
  });

  it('Rejects requesting hints when all hints have been unlocked', async () => {
    const newCaseRes = await request(app)
      .post('/api/cases')
      .send({ difficulty: 'easy', premise: 'Test hint exhaustion on easy case.' });
    const activeCaseId = newCaseRes.body.case.caseId;
    const activeToken = newCaseRes.body.caseToken;

    // Easy has 2 hints
    // Hint 1
    const h1 = await request(app).post(`/api/cases/${activeCaseId}/hints`).set('x-case-token', activeToken);
    expect(h1.status).toBe(200);
    // Hint 2
    const h2 = await request(app).post(`/api/cases/${activeCaseId}/hints`).set('x-case-token', activeToken);
    expect(h2.status).toBe(200);

    // Hint 3 (exceeds limit)
    const h3 = await request(app).post(`/api/cases/${activeCaseId}/hints`).set('x-case-token', activeToken);
    expect(h3.status).toBe(400);
    expect(h3.body.message).toContain('already been deciphered');
  });

  it('GET /api/cases/:id returns 404 for non-existent case', async () => {
    const res = await request(app).get('/api/cases/CASE-000000');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Server Error');
  });
});
