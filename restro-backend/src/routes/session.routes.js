import { Router } from 'express';
import { getCurrentSessionState } from '../controllers/session.controller.js';
import { sessionRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

// Reconnection State Hydration API with rate limiting
router.get('/current', sessionRateLimiter, getCurrentSessionState);

export default router;
