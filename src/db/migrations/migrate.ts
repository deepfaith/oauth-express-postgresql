import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

/**
 * Creates necessary database tables and inserts initial data for OAuth clients.
 */
const createTables = async () => {
    try {
        await pool.query(`
        -- Clients Table (Stores existing clients with their API keys)
        CREATE TABLE IF NOT EXISTS oauth_clients (
            client_id TEXT PRIMARY KEY,
            client_secret TEXT NOT NULL,
            name TEXT NOT NULL
        );
        
        -- Authorization Codes (Stores temporary authorization codes for OAuth2)
        CREATE TABLE IF NOT EXISTS oauth_codes (
            code TEXT PRIMARY KEY,
            client_id TEXT NOT NULL REFERENCES oauth_clients(client_id),
            expires_at TIMESTAMP NOT NULL
        );
        
        -- OAuth Tokens (Stores issued access and refresh tokens)
        CREATE TABLE IF NOT EXISTS oauth_tokens (
            token_id SERIAL PRIMARY KEY,
            client_id TEXT NOT NULL REFERENCES oauth_clients(client_id),
            user_id TEXT,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            expires_at TIMESTAMP NOT NULL
        );
        
        -- Subscribers (Stores subscriber information)
        CREATE TABLE IF NOT EXISTS subscribers (
            phone_number TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            domain TEXT NOT NULL,
            status TEXT CHECK (status IN ('ACTIVE', 'INACTIVE')),
            features JSONB
        );
    `);

        console.log('Tables created successfully.');

        // Insert dummy OAuth clients
        await pool.query(`
            INSERT INTO oauth_clients (client_id, client_secret, name)
            VALUES ('client1', 'secret1', 'Test Client 1'),
                   ('client2', 'secret2', 'Test Client 2') ON CONFLICT (client_id) DO NOTHING;
        `);

        console.log('Dummy clients inserted successfully.');

        pool.end();
    } catch (error) {
        console.error('Error creating tables:', error);
        pool.end();
    }
};

createTables();
