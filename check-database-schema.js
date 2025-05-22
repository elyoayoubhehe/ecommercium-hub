require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabaseSchema() {
  console.log('Checking database schema for consistency...');
  
  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommercium_hub'
  });
  
  try {
    // Check orders table structure
    console.log('Checking orders table structure...');
    
    // 1. First check if billing_address exists
    let hasBillingAddress = false;
    try {
      const [columns] = await connection.query('SHOW COLUMNS FROM orders');
      const columnNames = columns.map(col => col.Field);
      hasBillingAddress = columnNames.includes('billing_address');
      
      console.log('Current orders table columns:', columnNames.join(', '));
      
      // Check for total vs total_amount
      const hasTotal = columnNames.includes('total');
      const hasTotalAmount = columnNames.includes('total_amount');
      
      if (hasTotal && !hasTotalAmount) {
        console.log('Found "total" but missing "total_amount" column');
        await connection.query('ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0');
        await connection.query('UPDATE orders SET total_amount = total WHERE total_amount = 0');
        console.log('Added "total_amount" column and copied values from "total"');
      } else if (hasTotalAmount && !hasTotal) {
        console.log('Found "total_amount" but missing "total" column');
        await connection.query('ALTER TABLE orders ADD COLUMN total DECIMAL(10, 2) DEFAULT 0');
        await connection.query('UPDATE orders SET total = total_amount WHERE total = 0');
        console.log('Added "total" column and copied values from "total_amount"');
      } else if (!hasTotal && !hasTotalAmount) {
        console.log('Both "total" and "total_amount" columns are missing. Adding both...');
        await connection.query('ALTER TABLE orders ADD COLUMN total DECIMAL(10, 2) DEFAULT 0');
        await connection.query('ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0');
        console.log('Added both "total" and "total_amount" columns');
      } else {
        console.log('Both "total" and "total_amount" columns exist');
      }
      
      // Check for subtotal, tax, shipping
      const hasSubtotal = columnNames.includes('subtotal');
      const hasTax = columnNames.includes('tax');
      const hasShipping = columnNames.includes('shipping');
      
      if (!hasSubtotal) {
        console.log('Missing "subtotal" column. Adding it...');
        await connection.query('ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0');
        console.log('Added "subtotal" column');
      }
      
      if (!hasTax) {
        console.log('Missing "tax" column. Adding it...');
        await connection.query('ALTER TABLE orders ADD COLUMN tax DECIMAL(10, 2) DEFAULT 0');
        console.log('Added "tax" column');
      }
      
      if (!hasShipping) {
        console.log('Missing "shipping" column. Adding it...');
        await connection.query('ALTER TABLE orders ADD COLUMN shipping DECIMAL(10, 2) DEFAULT 0');
        console.log('Added "shipping" column');
      }
      
      // Check for billing_address
      if (!hasBillingAddress) {
        console.log('Missing "billing_address" column. Adding it...');
        await connection.query('ALTER TABLE orders ADD COLUMN billing_address TEXT');
        
        // Copy shipping address to billing address for existing orders
        await connection.query('UPDATE orders SET billing_address = shipping_address WHERE billing_address IS NULL');
        console.log('Added "billing_address" column and copied values from shipping_address');
      }
      
      // Check the "status" field values
      const [statusInfoRows] = await connection.query('SHOW COLUMNS FROM orders WHERE Field = "status"');
      if (statusInfoRows.length > 0) {
        const statusInfo = statusInfoRows[0];
        console.log('Current status values:', statusInfo.Type);
        
        // Ensure "cancelled" is included (might be "canceled" in some schemas)
        if (statusInfo.Type.includes('canceled') && !statusInfo.Type.includes('cancelled')) {
          console.log('Updating status field to include "cancelled" value...');
          await connection.query(`
            ALTER TABLE orders MODIFY COLUMN status 
            ENUM('pending', 'processing', 'shipped', 'delivered', 'canceled', 'cancelled') 
            DEFAULT 'pending'
          `);
          console.log('Status field updated to include "cancelled"');
        }
      }
      
    } catch (error) {
      console.error('Error checking orders table:', error.message);
    }
    
    // 2. Check order_items table
    console.log('\nChecking order_items table structure...');
    try {
      const [orderItemsColumns] = await connection.query('SHOW COLUMNS FROM order_items');
      const columnNames = orderItemsColumns.map(col => col.Field);
      
      console.log('Current order_items table columns:', columnNames.join(', '));
      
      // Check for all required columns
      const requiredColumns = ['order_id', 'product_id', 'quantity', 'price'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.error(`Warning: Missing required columns in order_items table: ${missingColumns.join(', ')}`);
      } else {
        console.log('All required columns found in order_items table');
      }
    } catch (error) {
      console.error('Error checking order_items table:', error.message);
    }
    
    console.log('\nDatabase schema check completed!');
    
  } catch (error) {
    console.error('Error during database schema check:', error);
  } finally {
    await connection.end();
  }
}

// Run the check
checkDatabaseSchema(); 