import 'dotenv/config';
import { pool } from './db';

async function addResetFields() {
  const client = await pool.connect();
  
  try {
    console.log('Adding password reset fields to users table...');
    
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR
    `);
    
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP
    `);
    
    console.log('✓ Password reset fields added successfully!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addResetFields().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});