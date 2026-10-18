import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.QR_JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Generate a cryptographically signed QR token bound to tableNumber, restaurantId, and branch HMAC signature
 */
export const generateTableToken = (tableNumber, restaurantId = '650000000000000000000001') => {
    const restIdStr = restaurantId?.toString() || '650000000000000000000001';

    // Cryptographic branch signature binding table to restaurant location
    const branchSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${tableNumber}:${restIdStr}`)
        .digest('hex')
        .slice(0, 16);

    return jwt.sign(
        { 
            tableNumber,
            restaurantId: restIdStr,
            branchSignature,
            scope: 'TABLE_ORDER' 
        }, 
        JWT_SECRET
    );
};

/**
 * Generate a signed Customer Session token bound to active table session
 */
export const generateSessionToken = (sessionId, tableNumber) => {
    return jwt.sign(
        {
            sessionId: sessionId.toString(),
            tableNumber,
            scope: 'CUSTOMER_SESSION'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export const verifyTableToken = (req, res, next) => {
    const token = req.query.token || req.headers['x-table-token'];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Token missing! Please scan a valid table QR code.' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.scope !== 'TABLE_ORDER') {
            return res.status(403).json({ 
                success: false, 
                error: 'Invalid token scope.' 
            });
        }

        // Verify Branch / Restaurant HMAC signature to prevent cross-branch token replay
        const restIdStr = decoded.restaurantId || '650000000000000000000001';
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${decoded.tableNumber}:${restIdStr}`)
            .digest('hex')
            .slice(0, 16);

        if (decoded.branchSignature && decoded.branchSignature !== expectedSignature) {
            return res.status(403).json({ 
                success: false, 
                error: 'Cross-branch replay detected: Token branch signature is invalid.' 
            });
        }

        req.tableContext = {
            tableNumber: decoded.tableNumber,
            restaurantId: restIdStr
        };

        next();
    } catch (err) {
        return res.status(403).json({ 
            success: false, 
            error: 'QR Code signature invalid ya tamper kiya gaya hai!' 
        });
    }
};

export { JWT_SECRET };