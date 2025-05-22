-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ecommercium_hub;

-- Use the database
USE ecommercium_hub;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'canceled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  billing_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION
);

-- Insert default admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, role)
VALUES ('Admin', 'User', 'admin@example.com', '$2b$10$1K.1YKwTvHrewcGLOI2.c.XGxFZpgV7dPpMQ0Fwxfh8OLjvPPG0gS', 'admin')
ON DUPLICATE KEY UPDATE
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  password = VALUES(password),
  role = VALUES(role);

-- Insert sample categories if they don't exist
INSERT IGNORE INTO categories (name, description)
VALUES 
  ('Electronics', 'Electronic devices and accessories'),
  ('Clothing', 'Apparel and fashion items'),
  ('Home & Kitchen', 'Products for home and kitchen'),
  ('Books', 'Books, e-books, and publications');

-- Insert sample products if they don't exist
INSERT IGNORE INTO products (category_id, name, description, price, stock_quantity)
VALUES
  (1, 'Smartphone X', 'Latest smartphone with advanced features', 699.99, 50),
  (1, 'Laptop Pro', 'High-performance laptop for professionals', 1299.99, 30),
  (1, 'Wireless Earbuds', 'Premium wireless earbuds with noise cancellation', 149.99, 100),
  (2, 'Cotton T-Shirt', 'Comfortable cotton t-shirt, available in multiple colors', 19.99, 200),
  (2, 'Jeans', 'Classic jeans with modern fit', 49.99, 150),
  (3, 'Blender', 'Powerful blender for smoothies and more', 79.99, 40),
  (3, 'Cookware Set', 'Complete cookware set with non-stick coating', 199.99, 25),
  (4, 'Programming Guide', 'Comprehensive guide to modern programming', 34.99, 60),
  (4, 'Science Fiction Collection', 'Collection of best sci-fi novels', 29.99, 45);

-- Add indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id); 