const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCategories() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'ayoubelyo05',
      database: process.env.DB_DATABASE || 'ecommercium_hub'
    });
    console.log('Connected to database');
    
    // Categories to add
    const categories = [
      { id: 1, name: 'Electronics', description: 'Electronic devices and accessories' },
      { id: 2, name: 'Clothing', description: 'Apparel and fashion items' },
      { id: 3, name: 'Home & Kitchen', description: 'Products for home and kitchen' },
      { id: 4, name: 'Books', description: 'Books, e-books, and publications' },
      { id: 5, name: 'Sports', description: 'Sports equipment and accessories' },
      { id: 6, name: 'Beauty', description: 'Beauty and personal care products' }
    ];
    
    // Get existing categories
    const [existingCategories] = await connection.query('SELECT * FROM categories');
    console.log(`Found ${existingCategories.length} existing categories`);
    
    // Update or insert categories
    console.log('Adding/updating categories...');
    for (const category of categories) {
      // Check if category exists
      const exists = existingCategories.some(c => c.id === category.id);
      
      if (exists) {
        // Update existing category
        await connection.query(
          'UPDATE categories SET name = ?, description = ? WHERE id = ?',
          [category.name, category.description, category.id]
        );
        console.log(`Updated category: ${category.name}`);
      } else {
        // Insert new category
        await connection.query(
          'INSERT INTO categories (id, name, description) VALUES (?, ?, ?)',
          [category.id, category.name, category.description]
        );
        console.log(`Added category: ${category.name}`);
      }
    }
    
    // Verify categories
    const [updatedCategories] = await connection.query('SELECT * FROM categories');
    console.log('\nCategories in database:');
    updatedCategories.forEach(cat => {
      console.log(`- ID: ${cat.id}, Name: ${cat.name}`);
    });
    
    console.log('\nCategory setup complete!');
    await connection.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

addCategories(); 