const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  console.log('Initializing database...');
  
  // Create connection to MySQL server
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Allow multiple SQL statements
  });
  
  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE || 'ecommercium_hub'}`);
    console.log(`Database '${process.env.DB_DATABASE || 'ecommercium_hub'}' created or already exists`);
    
    // Use the database
    await connection.query(`USE ${process.env.DB_DATABASE || 'ecommercium_hub'}`);
    
    // Create necessary tables
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role ENUM('admin', 'customer') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');
    
    // Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Categories table created or already exists');
    
    // Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        category_id INT,
        image_url VARCHAR(255),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    console.log('Products table created or already exists');
    
    // Wishlist table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_wishlist_item (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('Wishlists table created or already exists');
    
    // Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) NOT NULL,
        shipping DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        shipping_address JSON NOT NULL,
        payment_method JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Orders table created or already exists');
    
    // Order items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      )
    `);
    console.log('Order items table created or already exists');
    
    // Create indexes for better performance
    try {
      // MySQL doesn't support IF NOT EXISTS for indexes directly, so we need to handle each one separately
      try {
        await connection.query(`CREATE INDEX idx_products_category ON products(category_id)`);
        console.log('Index idx_products_category created');
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('Index idx_products_category already exists');
        } else {
          throw err;
        }
      }
      
      try {
        await connection.query(`CREATE INDEX idx_wishlists_user ON wishlists(user_id)`);
        console.log('Index idx_wishlists_user created');
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('Index idx_wishlists_user already exists');
        } else {
          throw err;
        }
      }
      
      try {
        await connection.query(`CREATE INDEX idx_wishlists_product ON wishlists(product_id)`);
        console.log('Index idx_wishlists_product created');
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('Index idx_wishlists_product already exists');
        } else {
          throw err;
        }
      }
      
      try {
        await connection.query(`CREATE INDEX idx_orders_user ON orders(user_id)`);
        console.log('Index idx_orders_user created');
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('Index idx_orders_user already exists');
        } else {
          throw err;
        }
      }
      
      try {
        await connection.query(`CREATE INDEX idx_order_items_order ON order_items(order_id)`);
        console.log('Index idx_order_items_order created');
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('Index idx_order_items_order already exists');
        } else {
          throw err;
        }
      }
      
      try {
        await connection.query(`CREATE INDEX idx_order_items_product ON order_items(product_id)`);
        console.log('Index idx_order_items_product created');
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('Index idx_order_items_product already exists');
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

// Run the initialization function
initializeDatabase(); 