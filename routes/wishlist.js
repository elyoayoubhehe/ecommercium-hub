const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get user's wishlist (requires authentication)
router.get('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.db;
    
    // Join with products to get product details
    const [rows] = await pool.query(
      `SELECT w.id, w.product_id, w.added_at, 
              p.name, p.description, p.price, p.image_url, p.category_id,
              c.name as category 
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ?`,
      [req.user.id]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add item to wishlist (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const { product_id } = req.body;
    const pool = req.app.locals.db;
    
    // Check if product exists
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Add to wishlist (MySQL will handle UNIQUE constraint)
    try {
      await pool.query(
        'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
        [req.user.id, product_id]
      );
    } catch (err) {
      // If item already exists, just ignore the error (it's already in the wishlist)
      if (!err.code === 'ER_DUP_ENTRY') {
        throw err;
      }
    }
    
    // Get updated wishlist
    const [wishlist] = await pool.query(
      `SELECT w.id, w.product_id, w.added_at, 
              p.name, p.description, p.price, p.image_url, p.category_id,
              c.name as category 
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ?`,
      [req.user.id]
    );
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove item from wishlist (requires authentication)
router.delete('/:product_id', auth, async (req, res) => {
  try {
    const pool = req.app.locals.db;
    
    await pool.query(
      'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
      [req.user.id, req.params.product_id]
    );
    
    // Get updated wishlist
    const [wishlist] = await pool.query(
      `SELECT w.id, w.product_id, w.added_at, 
              p.name, p.description, p.price, p.image_url, p.category_id,
              c.name as category 
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ?`,
      [req.user.id]
    );
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: error.message });
  }
});

// Clear wishlist (requires authentication)
router.delete('/', auth, async (req, res) => {
  try {
    const pool = req.app.locals.db;
    
    await pool.query('DELETE FROM wishlists WHERE user_id = ?', [req.user.id]);
    
    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 