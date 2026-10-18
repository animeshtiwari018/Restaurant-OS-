import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for Table QR verification routes
 * Guards against brute-force token enumeration & QR flooding
 */
export const qrVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 150, // Limit each IP to 150 requests per windowMs
    standardHeaders: true, // Return standard RateLimit headers (draft-7)
    legacyHeaders: false, // Disable X-RateLimit-* legacy headers
    statusCode: 429,
    message: {
        statusCode: 429,
        success: false,
        message: 'Too many QR verification requests from this IP. Please try again after 15 minutes.'
    }
});

/**
 * Rate limiter for Customer Session & OTP endpoints
 * Guards against brute-force request flooding & session scanning
 */
export const sessionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 150, // Limit each IP to 150 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        statusCode: 429,
        success: false,
        message: 'Too many session requests from this IP. Please try again after 15 minutes.'
    }
});

export default { qrVerificationLimiter, sessionRateLimiter };
