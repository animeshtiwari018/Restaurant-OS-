import { Router } from 'express';
import { generateTableToken, verifyTableToken } from '../utils/token.js';

const router = Router();

router.get('/generate-qr/:tableNumber', (req, res) => {
    const { tableNumber } = req.params;
    const token = generateTableToken(tableNumber);

    res.status(200).json({
        success: true,
        tableNumber,
        token,
        fullScanUrl: `http://localhost:5173/menu?token=${token}`
    });
});

router.get('/verify-session', verifyTableToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Table authenticated successfully!',
        session: req.tableContext
    });
});

export default router;