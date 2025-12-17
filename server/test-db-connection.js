require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const run = async () => {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');

  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not defined');
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT version()`;
    console.log('✅ Connection successful!');
    console.log('Database version:', result[0].version);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
};

run();
