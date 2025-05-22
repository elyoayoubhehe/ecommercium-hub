const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function debugAuth() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'ayoubelyo05',
      database: process.env.DB_DATABASE || 'ecommercium_hub'
    });
    console.log('Connected to database');

    // Test email and password
    const email = 'admin@example.com';
    const password = 'admin123';
    
    console.log(`Testing login for: ${email}`);
    
    // Find user
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      console.log('Error: User not found');
      return;
    }
    
    const user = users[0];
    console.log('User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      passwordHash: user.password?.substr(0, 20) + '...' // Only show part of the hash for security
    });
    
    // Check password
    console.log('Checking password...');
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
      
      if (!isMatch) {
        console.log('Error: Invalid password');
        return;
      }
    } catch (err) {
      console.error('Error comparing passwords:', err);
      return;
    }
    
    // Generate JWT
    console.log('Generating JWT...');
    try {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'ecommercium_secret_key_12345',
        { expiresIn: '1h' }
      );
      console.log('Token generated successfully');
      console.log('Login successful! Token:', token.substring(0, 20) + '...');
    } catch (err) {
      console.error('Error generating token:', err);
    }
    
    await connection.end();
  } catch (err) {
    console.error('Debug error:', err);
  }
}

debugAuth(); 