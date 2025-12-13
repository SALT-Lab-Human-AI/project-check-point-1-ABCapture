import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addNotesColumn() {
  try {
    console.log('🔍 Checking if notes column exists...');
    
    // Check if notes column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' AND column_name = 'notes'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('➕ Adding notes column to students table...');
      await pool.query(`ALTER TABLE students ADD COLUMN notes TEXT`);
      console.log('✅ Successfully added notes column to students table');
    } else {
      console.log('ℹ️  Notes column already exists in students table');
    }
    
    // Fix existing students with NULL grades before making grade NOT NULL
    console.log('🔧 Fixing students with NULL grades...');
    const nullGradeStudents = await pool.query(`
      SELECT id, name, grade FROM students WHERE grade IS NULL
    `);
    
    if (nullGradeStudents.rows.length > 0) {
      console.log(`Found ${nullGradeStudents.rows.length} students with NULL grades:`);
      nullGradeStudents.rows.forEach(student => {
        console.log(`- ${student.name} (ID: ${student.id})`);
      });
      
      // Set default grade for students with NULL grades
      await pool.query(`UPDATE students SET grade = 'Unknown' WHERE grade IS NULL`);
      console.log('✅ Updated students with NULL grades to "Unknown"');
    } else {
      console.log('✅ No students with NULL grades found');
    }
    
    // Now make grade column NOT NULL
    console.log('🔧 Making grade column NOT NULL...');
    const gradeCheckResult = await pool.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'students' AND column_name = 'grade'
    `);
    
    if (gradeCheckResult.rows[0]?.is_nullable === 'YES') {
      await pool.query(`ALTER TABLE students ALTER COLUMN grade SET NOT NULL`);
      console.log('✅ Made grade column NOT NULL');
    } else {
      console.log('ℹ️  Grade column is already NOT NULL');
    }
    
    // Check current students table structure
    console.log('🔍 Current students table structure:');
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'students'
      ORDER BY ordinal_position
    `);
    
    console.table(tableStructure.rows);
    
    // Check if there are any students with notes
    console.log('🔍 Checking existing students for notes...');
    const studentsWithNotes = await pool.query(`
      SELECT id, name, notes 
      FROM students 
      WHERE notes IS NOT NULL AND notes != ''
    `);
    
    console.log(`Found ${studentsWithNotes.rows.length} students with notes:`);
    studentsWithNotes.rows.forEach(student => {
      console.log(`- ${student.name}: "${student.notes}"`);
    });
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addNotesColumn();
