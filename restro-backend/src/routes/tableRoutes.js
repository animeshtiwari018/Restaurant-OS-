import { Router } from 'express';
import { verifyTableToken } from '../utils/token.js';
import {
    createTable,
    getTables,
    getTableQRCode,
    verifyAndGetSession,
    closeTableSession
} from '../controllers/table.controller.js';
import { getCurrentSessionState } from '../controllers/session.controller.js';
import { qrVerificationLimiter, sessionRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

// Table management
router.route('/')
    .post(createTable)
    .get(getTables);

// QR generation & session verification with rate limiting
router.get('/generate-qr/:tableNumber', qrVerificationLimiter, getTableQRCode);
router.get('/verify-session', qrVerificationLimiter, verifyTableToken, verifyAndGetSession);
router.get('/qr/:token', (req, res, next) => {
    req.query.token = req.params.token;
    next();
}, qrVerificationLimiter, verifyTableToken, verifyAndGetSession);

// Session reconnection / state hydration (also accessible via /api/v1/tables/sessions/current)
router.get('/sessions/current', sessionRateLimiter, getCurrentSessionState);

// Session closure
router.post('/sessions/:sessionId/close', sessionRateLimiter, closeTableSession);

export default router;