import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addNotesField() {
  try {
    console.log('Adding notes column to students table...');
    
    // Check if notes column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' AND column_name = 'notes'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add notes column
      await pool.query(`ALTER TABLE students ADD COLUMN notes TEXT`);
      console.log('✅ Added notes column to students table');
    } else {
      console.log('ℹ️  Notes column already exists in students table');
    }
    
    // Check if grade column is nullable
    const gradeCheckResult = await pool.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'students' AND column_name = 'grade'
    `);
    
    if (gradeCheckResult.rows[0]?.is_nullable === 'YES') {
      // Make grade column NOT NULL
      await pool.query(`ALTER TABLE students ALTER COLUMN grade SET NOT NULL`);
      console.log('✅ Made grade column NOT NULL');
    } else {
      console.log('ℹ️  Grade column is already NOT NULL');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addNotesField();
