const mysql = require('mysql2/promise');
require('dotenv').config();

// Updated with the provided password
const password = 'ayoubelyo05';

async function checkDatabase() {
  try {
    // Create a connection (with password this time)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: password, // Using password
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
          
          // Create admin user if none exists
          console.log('\nCreating admin user...');
          const adminPassword = '$2b$10$1K.1YKwTvHrewcGLOI2.c.XGxFZpgV7dPpMQ0Fwxfh8OLjvPPG0gS'; // Hashed 'admin123'
          await connection.query(
            'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            ['Admin', 'User', 'admin@example.com', adminPassword, 'admin']
          );
          console.log('Admin user created with:\n- Email: admin@example.com\n- Password: admin123');
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