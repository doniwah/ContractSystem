
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
    });

    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('Tables in "public" schema:');
        console.table(res.rows);
        console.log('Columns in "users" table:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
