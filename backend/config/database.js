require('dotenv').config();
const MySQLToPGWrapper = require('./db_wrapper');

const dbConfig = {
    // If DB_URL or DATABASE_URL is provided (e.g. Supabase connection string), use it
    connectionString: process.env.DATABASE_URL || process.env.DB_URL,
    
    // Fallback to individual variables if no connection string is provided
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'engineering_erp',
    port: process.env.DB_PORT || 5432
};

// Create the wrapper pool which routes/controllers will use as if it were MySQL
const pool = new MySQLToPGWrapper(dbConfig);

// Auto Database Initialization function
const initializeDatabase = async () => {
    try {
        console.log(`[DB] Attempting PostgreSQL server connection...`);
        
        // Test internal pool connection stability
        const poolConnection = await pool.getConnection();
        console.log(`[DB SUCCESS] PostgreSQL Connected to pool successfully.`);
        poolConnection.release();

        console.log(`[DB INFO] Notice: Automatic table creation is disabled for PostgreSQL.`);
        console.log(`[DB INFO] Please run 'database/schema_postgres.sql' manually in your Supabase SQL Editor to set up tables.`);

    } catch (error) {
        // Logs the exact error string clearly but purposefully does NOT throw it,
        // allowing the Express server to continue running gracefully!
        console.error(`[DB ERROR] PostgreSQL initialization failed:`, error.message);
    }
};

// Execute initialization logic on startup
initializeDatabase();

module.exports = pool;
