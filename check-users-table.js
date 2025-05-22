const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsersTable() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'ayoubelyo05',
      database: process.env.DB_DATABASE || 'ecommercium_hub'
    });
    
    console.log('Connected to MySQL database');
    
    // Check users table structure
    console.log('\nUsers table structure:');
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}${column.Null === 'NO' ? ' (NOT NULL)' : ''} ${column.Default ? `DEFAULT: ${column.Default}` : ''}`);
    });
    
    // Also check current users
    console.log('\nCurrent users:');
    const [users] = await connection.query('SELECT id, email, first_name, last_name, role FROM users');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}, Role: ${user.role}`);
    });
    
    await connection.end();
    console.log('\nUsers table check complete');
  } catch (err) {
    console.error('Database error:', err);
  }
}

// Run the async function and make sure we wait for it to complete
checkUsersTable().then(() => console.log('Script finished')); 