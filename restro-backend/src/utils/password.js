import crypto from 'crypto';

/**
 * Hash password using PBKDF2 with salt
 */
export const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
            if (err) return reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
};

/**
 * Verify password against stored hash
 */
export const comparePassword = (password, storedHash) => {
    return new Promise((resolve, reject) => {
        if (!storedHash || !storedHash.includes(':')) {
            return resolve(false);
        }
        const [salt, key] = storedHash.split(':');
        crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
            if (err) return reject(err);
            resolve(key === derivedKey.toString('hex'));
        });
    });
};
