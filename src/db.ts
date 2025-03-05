import {Pool} from 'pg';

// Initialize PostgreSQL Pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


export const getClient = async () => {
    const client = await pool.connect();
    return client;
};
