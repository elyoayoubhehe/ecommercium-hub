const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'ayoubelyo05',
      database: process.env.DB_DATABASE || 'ecommercium_hub'
    });
    
    console.log('Connected to MySQL database');
    
    // Check database tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\nDatabase tables:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    // Check users
    const [users] = await connection.query('SELECT id, email, first_name, last_name, role FROM users');
    console.log('\nUsers:');
    console.log(`Found ${users.length} users`);
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`- ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
    // Check products
    const [products] = await connection.query('SELECT * FROM products');
    console.log('\nProducts:');
    console.log(`Found ${products.length} products`);
    if (products.length > 0) {
      products.forEach(product => {
        console.log(`- ID: ${product.id}, Name: ${product.name}, Price: ${product.price}`);
      });
    }
    
    // Check categories
    const [categories] = await connection.query('SELECT * FROM categories');
    console.log('\nCategories:');
    console.log(`Found ${categories.length} categories`);
    if (categories.length > 0) {
      categories.forEach(category => {
        console.log(`- ID: ${category.id}, Name: ${category.name}`);
      });
    }
    
    await connection.end();
    console.log('\nDatabase check complete');
  } catch (err) {
    console.error('Database error:', err);
  }
}

checkDatabase(); 