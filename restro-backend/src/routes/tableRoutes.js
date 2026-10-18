import { Router } from 'express';
import { verifyTableToken } from '../utils/token.js';
import {
    createTable,
    getTables,
    getTableQRCode,
    verifyAndGetSession,
    closeTableSession
} from '../controllers/table.controller.js';

const router = Router();

// Table management
router.route('/')
    .post(createTable)
    .get(getTables);

// QR generation & session verification
router.get('/generate-qr/:tableNumber', getTableQRCode);
router.get('/verify-session', verifyTableToken, verifyAndGetSession);

// Session closure
router.post('/sessions/:sessionId/close', closeTableSession);

export default router;