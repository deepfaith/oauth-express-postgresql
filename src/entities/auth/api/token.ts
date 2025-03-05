import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

/**
 * Generates an access token for OAuth2 authentication.
 * @param {string} clientId - The client identifier.
 * @param {string} [userId] - The optional user identifier.
 * @returns {string} The generated JWT token.
 */
export const generateAccessToken = (clientId: string, userId?: string) => {
    return jwt.sign({clientId, userId}, process.env.JWT_SECRET as string, {expiresIn: '15m'});
};

/**
 * Generates a refresh token using random bytes.
 * @returns {string} The generated hex string of the refresh token.
 */
export const generateRefreshToken = () => {
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    return CryptoJS.enc.Hex.stringify(randomBytes);
};

/**
 * Middleware to authenticate a token.
 * @param {any} req - The request object.
 * @param {any} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({message: 'Unauthorized'});

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) return res.status(403).json({message: 'Forbidden'});
        req.user = user;
        next();
    });
};
