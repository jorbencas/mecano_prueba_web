const { sql } = require('../db');

async function makeAdmin() {
  try {
    const email = 'jorbencas@gmail.com';
    console.log(`Making ${email} an admin...`);
    
    const result = await sql`
      UPDATE users
      SET role = 'admin'
      WHERE email = ${email}
      RETURNING id, email, role
    `;

    if (result.length > 0) {
      console.log('Success:', result[0]);
    } else {
      console.log('User not found.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  }
}

makeAdmin();
