import 'dotenv/config';
import { pool } from './db';
import { storage } from './storage';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Migration script to:
 * 1. Create parents table (separate from users)
 * 2. Migrate existing parent users to parents table
 * 3. Update parent_students to reference parents instead of users
 * 4. Remove parent role from users table
 * 5. Add teacher users
 * 6. Import students from CSV
 */

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting migration...\n');
    
    // Step 1: Create parents table
    console.log('1. Creating parents table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS parents (
        id serial PRIMARY KEY,
        email varchar NOT NULL,
        first_name varchar,
        last_name varchar,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);
    console.log('✓ Parents table created\n');
    
    // Step 2: Migrate existing parent users to parents table
    console.log('2. Migrating existing parent users...');
    const parentUsers = await client.query(`
      SELECT id, email, first_name, last_name, created_at 
      FROM users 
      WHERE role = 'parent'
    `);
    
    if (parentUsers.rowCount > 0) {
      console.log(`  Found ${parentUsers.rowCount} parent users to migrate`);
      
      for (const parentUser of parentUsers.rows) {
        // Insert into parents table
        const insertResult = await client.query(`
          INSERT INTO parents (email, first_name, last_name, created_at)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [parentUser.email, parentUser.first_name, parentUser.last_name, parentUser.created_at]);
        
        const newParentId = insertResult.rows[0].id;
        
        // Update parent_students references
        await client.query(`
          UPDATE parent_students 
          SET parent_id = $1 
          WHERE parent_id = $2
        `, [newParentId, parentUser.id]);
        
        console.log(`  ✓ Migrated: ${parentUser.email}`);
      }
    } else {
      console.log('  No parent users found to migrate');
    }
    console.log('✓ Parent migration complete\n');
    
    // Step 3: Update parent_students table structure
    console.log('3. Updating parent_students table...');
    
    // Drop old foreign key constraint
    await client.query(`
      ALTER TABLE parent_students 
      DROP CONSTRAINT IF EXISTS parent_students_parent_id_fkey
    `);
    
    // Change parent_id column type to integer
    await client.query(`
      ALTER TABLE parent_students 
      ALTER COLUMN parent_id TYPE integer USING parent_id::integer
    `);
    
    // Add new foreign key constraint
    await client.query(`
      ALTER TABLE parent_students 
      ADD CONSTRAINT parent_students_parent_id_fkey 
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
    `);
    
    // Add unique constraint
    await client.query(`
      ALTER TABLE parent_students 
      ADD CONSTRAINT parent_students_parent_id_student_id_key 
      UNIQUE (parent_id, student_id)
    `);
    
    console.log('✓ parent_students table updated\n');
    
    // Step 4: Remove parent users and update role constraint
    console.log('4. Removing parent users and updating role constraint...');
    const deleteResult = await client.query("DELETE FROM users WHERE role = 'parent'");
    console.log(`  ✓ Removed ${deleteResult.rowCount} parent users`);
    
    await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await client.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role = 'teacher')");
    console.log('✓ Role constraint updated to only allow teacher\n');
    
    // Step 5: Add teacher users
    console.log('5. Adding teacher users...');
    const teachers = [
      { email: 'smkiel2@illinois.edu', firstName: 'Sara', lastName: 'Kiel', password: 'ChangeMe123!' },
      { email: 'manuela9@illinois.edu', firstName: 'Manuela', lastName: 'Rodriguez', password: 'ChangeMe123!' }
    ];
    
    for (const teacher of teachers) {
      try {
        const existingUser = await storage.getUserByEmail(teacher.email);
        if (existingUser) {
          console.log(`  - ${teacher.email} already exists, skipping`);
        } else {
          await storage.createUser({
            email: teacher.email,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            password: teacher.password,
            role: 'teacher'
          });
          console.log(`  ✓ Created teacher: ${teacher.email}`);
        }
      } catch (error: any) {
        console.error(`  ✗ Error creating ${teacher.email}:`, error.message);
      }
    }
    console.log('✓ Teacher users added\n');
    
    // Step 6: Import students from CSV
    console.log('6. Importing students from CSV...');
    const csvPath = path.join(__dirname, '..', 'mock student data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`✗ CSV file not found at: ${csvPath}`);
      console.log('  Please ensure "mock student data.csv" is in the Concept Iteration folder');
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log(`  Found ${lines.length - 1} rows in CSV`);
    
    let imported = 0;
    let skipped = 0;
    
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
      
      const { teacher_email, name, grade } = record;
      
      // Skip empty rows
      if (!teacher_email || !name) {
        skipped++;
        continue;
      }
      
      try {
        // Get teacher user ID
        const teacher = await storage.getUserByEmail(teacher_email);
        if (!teacher) {
          console.error(`  ✗ Teacher not found: ${teacher_email} for student ${name}`);
          skipped++;
          continue;
        }
        
        // Create student
        await storage.createStudent(teacher.id, {
          name: name,
          grade: grade || null
        });
        
        imported++;
        console.log(`  ✓ Imported: ${name} (Grade ${grade}) -> ${teacher_email}`);
      } catch (error: any) {
        console.error(`  ✗ Error importing ${name}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\n✓ Import complete: ${imported} students imported, ${skipped} skipped\n`);
    
    // Step 7: Verify results
    console.log('7. Verification:');
    const usersResult = await client.query("SELECT email, first_name, last_name, role FROM users WHERE role = 'teacher'");
    console.log(`  Teachers in database: ${usersResult.rowCount}`);
    usersResult.rows.forEach(user => {
      console.log(`    - ${user.email} (${user.first_name} ${user.last_name})`);
    });
    
    const studentsResult = await client.query('SELECT COUNT(*) as count FROM students');
    console.log(`  Total students: ${studentsResult.rows[0].count}`);
    
    const parentsResult = await client.query('SELECT COUNT(*) as count FROM parents');
    console.log(`  Total parents: ${parentsResult.rows[0].count}`);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  IMPORTANT: Default password for teachers is "ChangeMe123!" - please change after first login\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrate().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});