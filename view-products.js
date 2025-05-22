const mysql = require('mysql2/promise');
require('dotenv').config();

async function viewAllProducts() {
  try {
    console.log('Connecting to database...');
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'ayoubelyo05',
      database: process.env.DB_DATABASE || 'ecommercium_hub'
    });
    
    console.log('Connected to MySQL database');
    
    // Query to get all products with their category names
    const [products] = await connection.query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);
    
    console.log('\n===== ALL PRODUCTS IN DATABASE =====\n');
    
    if (products.length === 0) {
      console.log('No products found in the database.');
    } else {
      console.log(`Found ${products.length} products:`);
      console.log('\n');
      
      // Display products in a table format
      console.log('ID | Name | Price | Stock | Category | Description');
      console.log('-'.repeat(80));
      
      products.forEach(product => {
        console.log(`${product.id} | ${product.name} | $${product.price} | ${product.stock_quantity || 0} | ${product.category_name || 'No category'} | ${(product.description || '').substring(0, 30)}${product.description && product.description.length > 30 ? '...' : ''}`);
      });
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error accessing database:', err);
  }
}

// Run the function
viewAllProducts(); 