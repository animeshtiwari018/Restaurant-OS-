import { Router } from 'express';
import { getCurrentSessionState, callWaiterForSession } from '../controllers/session.controller.js';
import { sessionRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

// Reconnection State Hydration API with rate limiting
router.get('/current', sessionRateLimiter, getCurrentSessionState);

// Table Service / Waiter call assistance
router.post('/:sessionId/call-waiter', sessionRateLimiter, callWaiterForSession);

export default router;
