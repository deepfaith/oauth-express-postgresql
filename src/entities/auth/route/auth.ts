import {getClient} from "../../../db";
import {generateAccessToken, generateRefreshToken} from "../api";
import {Request, Response, Router} from "express";
import {body} from "express-validator";

/**
 * Router to handle authentication requests.
 */
export const router = Router();

/**
 * Middleware to validate authentication request body.
 */
const validateAuth = [
    body('grant_type').isIn(['authorization_code', 'client_credentials']).withMessage('Grant Type must be authorization_code or client_credentials'),
    body('code').optional().isString().isLength({min: 8}).withMessage('password must be at least 8 characters long'),
    body('client_id').isString().withMessage('client_id must be a string'),
    body('client_secret').optional().isString().withMessage('client_secret must be a string'),
    body('user_id').optional().isBoolean(),
];

/**
 * OAuth2 Token Endpoint to handle token generation based on grant type.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
router.post('/token', validateAuth, async (req: Request, res: Response) => {
    const {grant_type, code, client_id, client_secret, user_id} = req.body;

    try {
        const dbClient = await getClient();
        if (!client_id) return res.status(400).json({message: 'Client ID and secret required'});

        // Authorization Code Grant
        if (grant_type === 'authorization_code') {
            if (!code) return res.status(400).json({message: 'Authorization code required'});
            if (!user_id) return res.status(400).json({message: 'User Id is required'});

            const codeResult = await dbClient.query(
                'SELECT code, expires_at FROM oauth_codes WHERE client_id = $1 AND code = $2 AND expires_at > NOW()',
                [client_id, code]
            );

            if (codeResult.rows.length === 0) {
                return res.status(400).json({message: 'Invalid or expired authorization code'});
            }

            const tokenResult = await dbClient.query(
                'SELECT access_token, refresh_token, expires_at FROM oauth_tokens WHERE client_id = $1 AND user_id = $2 AND expires_at > NOW()',
                [client_id, user_id]
            );

            if (tokenResult.rows.length > 0) {
                return res.json({
                    access_token: tokenResult.rows[0].access_token,
                    refresh_token: tokenResult.rows[0].refresh_token
                });
            } else {
                const accessToken = generateAccessToken(client_id, user_id);
                const refreshToken = generateRefreshToken();
                await dbClient.query(
                    'INSERT INTO oauth_tokens (client_id, user_id, access_token, refresh_token, expires_at) VALUES ($1, $2, $3, $4, NOW() + INTERVAL \'15 minutes\')',
                    [client_id, user_id, accessToken, refreshToken]
                );


                return res.json({access_token: accessToken, refresh_token: refreshToken});
            }
        }


        // Client Credentials Grant
        else if (grant_type === 'client_credentials') {
            if (!client_secret) return res.status(400).json({message: 'Client ID and secret required'});

            // Validate client credentials
            const clientResult = await dbClient.query(
                'SELECT client_id FROM oauth_clients WHERE client_id = $1 AND client_secret = $2',
                [client_id, client_secret]
            );

            if (clientResult.rows.length === 0) return res.status(401).json({message: 'Invalid client credentials'});

            const tokenResult = await dbClient.query(
                'SELECT code, expires_at FROM oauth_codes WHERE client_id = $1 AND expires_at > NOW()',
                [client_id]
            );

            if (tokenResult.rows.length > 0) {
                return res.json({code: tokenResult.rows[0].code});
            } else {
                const accessToken = generateAccessToken(client_id);

                await dbClient.query(
                    'INSERT INTO oauth_codes (client_id, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'1 year\')',
                    [client_id, accessToken]
                );

                return res.json({access_token: accessToken});
            }
        }

        return res.status(400).json({message: 'Unsupported grant type'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
});

/**
 * Export the router as authRouter.
 */
export {router as authRouter};
