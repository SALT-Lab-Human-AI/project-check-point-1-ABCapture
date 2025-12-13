import 'dotenv/config';
import { pool } from './db';
import bcrypt from 'bcrypt';

/**
 * Script to reset a user's password
 * Usage: npm run db:reset-password <email> <new-password>
 */

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  
  if (!email || !newPassword) {
    console.error('❌ Error: Please provide email and new password');
    console.log('\nUsage:');
    console.log('  npm run db:reset-password <email> <new-password>');
    console.log('\nExample:');
    console.log('  npm run db:reset-password smkiel2@illinois.edu MyNewPassword123');
    process.exit(1);
  }
  
  if (newPassword.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters');
    process.exit(1);
  }
  
  const client = await pool.connect();
  
  try {
    console.log('🔐 Resetting password...');
    console.log(`Email: ${email}`);
    
    // Check if user exists
    const userResult = await client.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rowCount === 0) {
      console.error(`\n❌ User not found: ${email}`);
      console.log('\nAvailable users:');
      const allUsers = await client.query('SELECT email, first_name, last_name FROM users ORDER BY email');
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.first_name} ${user.last_name})`);
      });
      process.exit(1);
    }
    
    const user = userResult.rows[0];
    
    // Hash the new password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await client.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, email]
    );
    
    console.log('\n✅ Password reset successfully!');
    console.log(`\nUser: ${user.first_name} ${user.last_name} (${user.email})`);
    console.log(`New password: ${newPassword}`);
    console.log('\n⚠️  Please save this password securely and change it after first login.\n');
    
  } catch (error: any) {
    console.error('\n❌ Password reset failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run password reset
resetPassword().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});