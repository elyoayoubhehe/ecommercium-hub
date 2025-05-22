// Import required modules
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = 'ecommercium_secret_key';

// Define a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ecommercium_hub'
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// ===== PRODUCT ENDPOINTS =====

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new product (requires authentication)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock_quantity, category_id, image_url]
    );
    
    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update product (requires authentication)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { name, description, price, stock_quantity, category_id, image_url, status } = req.body;
    
    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, image_url = ?, status = ? WHERE id = ?',
      [name, description, price, stock_quantity, category_id, image_url, status, req.params.id]
    );
    
    const [updatedProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (updatedProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product (requires authentication)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

// ===== CATEGORY ENDPOINTS =====

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get category by ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
app.get('/api/categories/:id/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE category_id = ?', [req.params.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create category (requires authentication)
app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { name, description, icon } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
      [name, description, icon]
    );
    
    const [newCategory] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: error.message });
  }
});

// ===== USER AUTHENTICATION ENDPOINTS =====

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, first_name, last_name]
    );
    
    // Generate token
    const token = jwt.sign(
      { id: result.insertId, email, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user profile (requires authentication)
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: error.message });
  }
});

// ===== CART ENDPOINTS =====

// Get user's cart (requires authentication)
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await pool.query(
      `SELECT ci.*, p.name, p.price, p.image_url as image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart (requires authentication)
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    
    // Check if product exists
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if item already in cart
    const [existingItems] = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );
    
    if (existingItems.length > 0) {
      // Update quantity
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, req.user.id, product_id]
      );
    } else {
      // Add new item
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, quantity]
      );
    }
    
    // Get updated cart
    const [cartItems] = await pool.query(
      `SELECT ci.*, p.name, p.price, p.image_url as image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart (requires authentication)
app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    // Get updated cart
    const [cartItems] = await pool.query(
      `SELECT ci.*, p.name, p.price, p.image_url as image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// Clear cart (requires authentication)
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// ===== AUTHENTICATION MIDDLEWARE =====

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
}

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 