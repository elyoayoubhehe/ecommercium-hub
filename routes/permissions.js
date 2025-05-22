const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get permissions for a user
router.get('/:userId', auth, async (req, res) => {
  try {
    // Check if user is an admin with manage_admins permission
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const userId = req.params.userId;
    const pool = req.app.locals.db;
    
    // Check if user exists first
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get permissions
    const [permissions] = await pool.query('SELECT * FROM user_permissions WHERE user_id = ?', [userId]);
    
    if (permissions.length === 0) {
      // No permissions found, return defaults based on role
      const isAdmin = users[0].role === 'admin';
      return res.json({
        user_id: parseInt(userId),
        manage_orders: isAdmin,
        manage_products: isAdmin,
        manage_categories: isAdmin,
        manage_users: isAdmin,
        manage_admins: false, // Only explicitly granted
        view_analytics: isAdmin
      });
    }
    
    // Return found permissions
    res.json(permissions[0]);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update permissions for a user
router.put('/:userId', auth, async (req, res) => {
  try {
    // Check if user is an admin with manage_admins permission
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    // Check if the user has permission to manage admins
    const pool = req.app.locals.db;
    const [adminPermissions] = await pool.query(
      'SELECT manage_admins FROM user_permissions WHERE user_id = ?', 
      [req.user.id]
    );
    
    if (adminPermissions.length === 0 || !adminPermissions[0].manage_admins) {
      return res.status(403).json({ 
        message: 'You do not have permission to manage admin permissions.' 
      });
    }
    
    const userId = req.params.userId;
    const {
      manage_orders,
      manage_products,
      manage_categories,
      manage_users,
      manage_admins,
      view_analytics
    } = req.body;
    
    // Check if permissions already exist
    const [existingPermissions] = await pool.query(
      'SELECT * FROM user_permissions WHERE user_id = ?', 
      [userId]
    );
    
    if (existingPermissions.length === 0) {
      // Insert new permissions
      await pool.query(
        `INSERT INTO user_permissions 
         (user_id, manage_orders, manage_products, manage_categories, 
          manage_users, manage_admins, view_analytics) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [
          userId, 
          manage_orders || false, 
          manage_products || false, 
          manage_categories || false,
          manage_users || false, 
          manage_admins || false, 
          view_analytics || false
        ]
      );
    } else {
      // Update existing permissions
      await pool.query(
        `UPDATE user_permissions SET 
         manage_orders = ?, 
         manage_products = ?, 
         manage_categories = ?, 
         manage_users = ?, 
         manage_admins = ?, 
         view_analytics = ? 
         WHERE user_id = ?`, 
        [
          manage_orders || false, 
          manage_products || false, 
          manage_categories || false,
          manage_users || false, 
          manage_admins || false, 
          view_analytics || false,
          userId
        ]
      );
    }
    
    // Get updated permissions
    const [updatedPermissions] = await pool.query(
      'SELECT * FROM user_permissions WHERE user_id = ?',
      [userId]
    );
    
    res.json(updatedPermissions[0]);
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all users with their permissions
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const pool = req.app.locals.db;
    
    // Get all users with their permissions
    const [usersWithPermissions] = await pool.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.created_at, u.updated_at,
        p.manage_orders, p.manage_products, p.manage_categories, p.manage_users, 
        p.manage_admins, p.view_analytics
      FROM users u
      LEFT JOIN user_permissions p ON u.id = p.user_id
      WHERE u.role = 'admin'
    `);
    
    res.json(usersWithPermissions);
  } catch (error) {
    console.error('Error fetching users with permissions:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 