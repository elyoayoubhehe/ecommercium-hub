require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixOrderItemsSchema() {
  console.log('Fixing order_items table schema...');
  
  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommercium_hub'
  });
  
  try {
    // Check if price column exists
    const [columns] = await connection.query('SHOW COLUMNS FROM order_items');
    const columnNames = columns.map(col => col.Field);
    
    console.log('Current order_items table columns:', columnNames.join(', '));
    
    const hasPrice = columnNames.includes('price');
    const hasPriceAtPurchase = columnNames.includes('price_at_purchase');
    
    if (!hasPrice && hasPriceAtPurchase) {
      console.log('Found "price_at_purchase" but missing "price" column. Adding "price" column...');
      
      // Add price column
      await connection.query('ALTER TABLE order_items ADD COLUMN price DECIMAL(10, 2) DEFAULT 0');
      
      // Copy data from price_at_purchase to price
      await connection.query('UPDATE order_items SET price = price_at_purchase WHERE price = 0');
      
      console.log('Added "price" column and copied values from "price_at_purchase"');
    } else if (!hasPrice && !hasPriceAtPurchase) {
      console.log('Missing both "price" and "price_at_purchase" columns. Adding "price" column...');
      
      // Add price column
      await connection.query('ALTER TABLE order_items ADD COLUMN price DECIMAL(10, 2) DEFAULT 0');
      
      console.log('Added "price" column. You will need to populate it with product prices.');
      
      // Try to update price from products table
      try {
        console.log('Attempting to update prices from products table...');
        await connection.query(`
          UPDATE order_items oi
          JOIN products p ON oi.product_id = p.id
          SET oi.price = p.price
          WHERE oi.price = 0
        `);
        console.log('Updated prices from products table where possible');
      } catch (updateError) {
        console.error('Error updating prices from products table:', updateError.message);
      }
    } else if (hasPrice && hasPriceAtPurchase) {
      console.log('Both "price" and "price_at_purchase" columns exist. Ensuring they have the same values...');
      
      // Make sure they have the same values
      await connection.query(`
        UPDATE order_items 
        SET price = price_at_purchase 
        WHERE price != price_at_purchase
      `);
      
      console.log('Synchronized values between "price" and "price_at_purchase" columns');
    } else {
      console.log('The "price" column already exists. No changes needed.');
    }
    
    // Verify the changes
    const [updatedColumns] = await connection.query('SHOW COLUMNS FROM order_items');
    console.log('Updated order_items table columns:', updatedColumns.map(col => col.Field).join(', '));
    
    console.log('Order items schema fix completed!');
    
  } catch (error) {
    console.error('Error fixing order_items schema:', error);
  } finally {
    await connection.end();
  }
}

// Run the fix
fixOrderItemsSchema(); 