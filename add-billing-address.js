const mysql = require('mysql2/promise');
require('dotenv').config();

async function addBillingAddressColumn() {
  console.log('Checking orders table structure and adding billing_address column if needed...');
  
  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommercium_hub'
  });

  try {
    // Check if billing_address column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'billing_address'
    `, [process.env.DB_NAME || 'ecommercium_hub']);

    if (columns.length === 0) {
      console.log('billing_address column does not exist. Adding it...');
      
      // Add the billing_address column
      await connection.query(`
        ALTER TABLE orders 
        ADD COLUMN billing_address TEXT NULL
      `);
      
      console.log('billing_address column added successfully!');
    } else {
      console.log('billing_address column already exists. No action needed.');
    }
  } catch (error) {
    console.error('Error working with database:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed.');
  }
}

// Run the function
addBillingAddressColumn().catch(err => {
  console.error('Failed to execute database migration:', err);
  process.exit(1);
}); 