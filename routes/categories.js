const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.db;
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.db;
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new category (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { name, description, icon } = req.body;
    const pool = req.app.locals.db;
    
    const [result] = await pool.query(
      'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
      [name, description, icon]
    );
    
    const [newCategory] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(newCategory[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { name, description, icon } = req.body;
    const pool = req.app.locals.db;
    
    // First check if category exists
    const [existingCategory] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    
    if (existingCategory.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Update the category
    const [result] = await pool.query(
      'UPDATE categories SET name = ?, description = ?, icon = ? WHERE id = ?',
      [name, description, icon, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get the updated category
    const [updatedCategory] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json(updatedCategory[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const pool = req.app.locals.db;
    
    // First check if category exists
    const [existingCategory] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    
    if (existingCategory.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if any products use this category
    const [productsWithCategory] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE category_id = ?',
      [req.params.id]
    );
    
    if (productsWithCategory[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that has products. Please reassign or delete the products first.',
        productsCount: productsWithCategory[0].count
      });
    }
    
    // Delete the category
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting category:', error);
    
    // Check for foreign key constraint error
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        message: 'Cannot delete category that has products. Please reassign or delete the products first.'
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 