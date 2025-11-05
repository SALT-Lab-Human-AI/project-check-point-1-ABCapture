const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });

  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    // Read and execute the migration file
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations/002_add_edit_history.sql'), 
      'utf8'
    );
    
    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();