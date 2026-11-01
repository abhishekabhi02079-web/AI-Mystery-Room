import { Router } from 'express';
import { CaseController } from '../controllers/caseController.js';
import { requireCaseAuth } from '../middleware/authMiddleware.js';
import { caseCreationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Create new mystery case (rate limited)
router.post('/', caseCreationLimiter, CaseController.createCase);
router.get('/', CaseController.getCaseDossier);

// Retrieve active case public state
router.get('/:id', CaseController.getCase);

// Protected actions requiring x-case-token authorization
router.post('/:id/clues/:clueId/discover', requireCaseAuth, CaseController.discoverClue);
router.post('/:id/hints', requireCaseAuth, CaseController.requestHint);
router.post('/:id/accuse', requireCaseAuth, CaseController.accuseSuspect);
router.get('/:id/result', requireCaseAuth, CaseController.getCaseResult);

export default router;
