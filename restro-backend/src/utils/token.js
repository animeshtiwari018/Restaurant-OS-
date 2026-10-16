import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.QR_JWT_SECRET || 'fallback_secret_key';

export const generateTableToken = (tableNumber) => {
    return jwt.sign(
        { 
            tableNumber, 
            scope: 'TABLE_ORDER' 
        }, 
        JWT_SECRET
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

        req.tableContext = {
            tableNumber: decoded.tableNumber
        };

        next();
    } catch (err) {
        return res.status(403).json({ 
            success: false, 
            error: 'QR Code signature invalid ya tamper kiya gaya hai!' 
        });
    }
};