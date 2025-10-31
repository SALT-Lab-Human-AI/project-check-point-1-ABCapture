import 'dotenv/config';
import { pool } from './db';
import { db } from './db';
import { parents, parentStudents, students } from '@shared/schema';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { eq, and } from 'drizzle-orm';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script to import parent data from CSV and link them to students
 */

async function importParents() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting parent data import...\n');
    
    // Read CSV file
    console.log('1. Reading parent data CSV...');
    const csvPath = path.join(__dirname, '..', 'mock parent data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`✗ CSV file not found at: ${csvPath}`);
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log(`  Found ${lines.length - 1} rows in CSV\n`);
    
    // Track parents we've created to avoid duplicates
    const parentCache = new Map<string, number>(); // email -> parent_id
    
    let parentsCreated = 0;
    let relationshipsCreated = 0;
    let skipped = 0;
    
    console.log('2. Processing parent-student relationships...');
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        skipped++;
        continue;
      }
      
      const values = line.split(',').map(v => v.trim());
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      
      const parentName = record['parent'];
      const parentEmail = record['email'];
      const studentName = record['student name'];
      
      // Skip empty rows
      if (!parentName || !parentEmail || !studentName) {
        skipped++;
        continue;
      }
      
      try {
        // Get or create parent
        let parentId = parentCache.get(parentEmail);
        
        if (!parentId) {
          // Check if parent already exists in database
          const existingParent = await db
            .select()
            .from(parents)
            .where(eq(parents.email, parentEmail))
            .limit(1);
          
          if (existingParent.length > 0) {
            parentId = existingParent[0].id;
            console.log(`  ℹ Parent already exists: ${parentEmail}`);
          } else {
            // Parse first and last name
            const nameParts = parentName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            // Create new parent
            const [newParent] = await db
              .insert(parents)
              .values({
                email: parentEmail,
                firstName: firstName,
                lastName: lastName
              })
              .returning();
            
            parentId = newParent.id;
            parentsCreated++;
            console.log(`  ✓ Created parent: ${parentName} (${parentEmail})`);
          }
          
          parentCache.set(parentEmail, parentId);
        }
        
        // Find student by name
        const student = await db
          .select()
          .from(students)
          .where(eq(students.name, studentName))
          .limit(1);
        
        if (student.length === 0) {
          console.error(`  ✗ Student not found: ${studentName}`);
          skipped++;
          continue;
        }
        
        const studentId = student[0].id;
        
        // Check if relationship already exists
        const existingRelationship = await db
          .select()
          .from(parentStudents)
          .where(and(
            eq(parentStudents.parentId, parentId),
            eq(parentStudents.studentId, studentId)
          ))
          .limit(1);
        
        if (existingRelationship.length > 0) {
          console.log(`  - Relationship already exists: ${parentName} -> ${studentName}`);
        } else {
          // Create parent-student relationship
          await db
            .insert(parentStudents)
            .values({
              parentId: parentId,
              studentId: studentId
            });
          
          relationshipsCreated++;
          console.log(`  ✓ Linked: ${parentName} -> ${studentName}`);
        }
        
      } catch (error: any) {
        console.error(`  ✗ Error processing ${parentName} -> ${studentName}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\n✓ Import complete:`);
    console.log(`  - ${parentsCreated} new parents created`);
    console.log(`  - ${relationshipsCreated} parent-student relationships created`);
    console.log(`  - ${skipped} rows skipped\n`);
    
    // Verification
    console.log('3. Verification:');
    const parentsResult = await client.query('SELECT COUNT(*) as count FROM parents');
    console.log(`  Total parents in database: ${parentsResult.rows[0].count}`);
    
    const relationshipsResult = await client.query('SELECT COUNT(*) as count FROM parent_students');
    console.log(`  Total parent-student relationships: ${relationshipsResult.rows[0].count}`);
    
    // Show parent details
    const parentDetails = await client.query(`
      SELECT p.email, p.first_name, p.last_name, COUNT(ps.student_id) as student_count
      FROM parents p
      LEFT JOIN parent_students ps ON p.id = ps.parent_id
      GROUP BY p.id, p.email, p.first_name, p.last_name
      ORDER BY p.email
    `);
    
    console.log('\n  Parents and their student counts:');
    parentDetails.rows.forEach(parent => {
      console.log(`    - ${parent.first_name} ${parent.last_name} (${parent.email}): ${parent.student_count} students`);
    });
    
    console.log('\n✅ Parent import completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run import
importParents().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});