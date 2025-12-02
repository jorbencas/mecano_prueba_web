const { sql } = require('../db');

async function checkUsers() {
  try {
    const users = await sql`
      SELECT id, email, display_name, google_id, role, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `;

    console.log('--- Users in Database ---');
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Google ID: ${user.google_id}`);
        console.log(`Role: ${user.role}`);
        console.log(`Created: ${user.created_at}`);
        console.log(`Last Login: ${user.last_login}`);
        console.log('-------------------------');
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

checkUsers();
