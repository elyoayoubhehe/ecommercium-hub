const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    // Create a connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'ecommercium_hub'
    });
    
    console.log('Connected to MySQL database');
    
    // Check if database exists
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('Available databases:');
    databases.forEach(db => {
      console.log(`- ${db.Database}`);
    });
    
    try {
      // Use the database
      await connection.query(`USE ${process.env.DB_DATABASE || 'ecommercium_hub'}`);
      console.log(`\nUsing database: ${process.env.DB_DATABASE || 'ecommercium_hub'}`);
      
      // Check tables
      const [tables] = await connection.query('SHOW TABLES');
      console.log('\nDatabase tables:');
      if (tables.length === 0) {
        console.log('No tables found. Schema may not be initialized.');
      } else {
        tables.forEach(table => {
          console.log(`- ${Object.values(table)[0]}`);
        });
      }
      
      // Check admin user
      try {
        const [users] = await connection.query('SELECT id, email, first_name, last_name, role FROM users WHERE role="admin"');
        console.log('\nAdmin users:');
        if (users.length === 0) {
          console.log('No admin users found.');
        } else {
          users.forEach(user => {
            console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}, Role: ${user.role}`);
          });
        }
      } catch (err) {
        console.error('Error checking admin users:', err.message);
      }
    } catch (err) {
      console.error(`Error using database: ${err.message}`);
    }
    
    await connection.end();
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

checkDatabase(); 