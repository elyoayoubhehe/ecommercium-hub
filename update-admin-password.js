const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function updateAdminPassword() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'ayoubelyo05',
      database: process.env.DB_DATABASE || 'ecommercium_hub'
    });
    console.log('Connected to database');

    // New password to set
    const newPassword = 'admin123';
    const email = 'admin@example.com';
    
    // Hash the new password
    console.log('Hashing new password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the admin user's password
    console.log('Updating admin user password...');
    const [result] = await connection.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    if (result.affectedRows === 0) {
      console.log('Error: Admin user not found');
    } else {
      console.log('Admin password updated successfully!');
      console.log('You can now log in with:');
      console.log('- Email: admin@example.com');
      console.log('- Password: admin123');
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error updating admin password:', err);
  }
}

updateAdminPassword(); 