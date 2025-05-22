const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.db;
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.db;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;
    const pool = req.app.locals.db;
    
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock_quantity, category_id, image_url]
    );
    
    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;
    const pool = req.app.locals.db;
    
    // First check if product exists
    const [existingProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (existingProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update the product
    const [result] = await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, image_url = ? WHERE id = ?',
      [name, description, price, stock_quantity, category_id, image_url, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get the updated product
    const [updatedProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const pool = req.app.locals.db;
    
    // First check if product exists
    const [existingProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (existingProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete the product
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 