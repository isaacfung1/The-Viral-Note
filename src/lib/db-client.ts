import { Pool } from 'pg';

const pool = new Pool({
   connectionString: process.env.SUPABASE_DB_URL,
   ssl: {
    rejectUnauthorized: false
   },

  max: 20, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;