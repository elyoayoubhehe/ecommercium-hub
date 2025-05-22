const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    // Fetch all users
    const pool = req.app.locals.db;
    const [users] = await pool.query('SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users');
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    const pool = req.app.locals.db;
    
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
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create admin user (only admins with manage_admins permission can do this)
router.post('/admin', auth, async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    // Check if the requester has permission to manage admins
    const pool = req.app.locals.db;
    const [adminPermissions] = await pool.query(
      'SELECT manage_admins FROM user_permissions WHERE user_id = ?', 
      [req.user.id]
    );
    
    if (adminPermissions.length === 0 || !adminPermissions[0].manage_admins) {
      return res.status(403).json({ 
        message: 'You do not have permission to create admin users.' 
      });
    }
    
    const { email, password, first_name, last_name, permissions } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, first_name, last_name, 'admin']
    );
    
    const userId = result.insertId;
    
    // Set permissions if provided
    if (permissions) {
      await pool.query(
        `INSERT INTO user_permissions 
         (user_id, manage_orders, manage_products, manage_categories, 
          manage_users, manage_admins, view_analytics) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [
          userId, 
          permissions.manage_orders || false, 
          permissions.manage_products || false, 
          permissions.manage_categories || false,
          permissions.manage_users || false, 
          permissions.manage_admins || false, 
          permissions.view_analytics || false
        ]
      );
    } else {
      // Set default permissions - everything except manage_admins
      await pool.query(
        `INSERT INTO user_permissions 
         (user_id, manage_orders, manage_products, manage_categories, 
          manage_users, manage_admins, view_analytics) 
         VALUES (?, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE)`, 
        [userId]
      );
    }
    
    res.status(201).json({ 
      message: 'Admin user created successfully',
      id: userId,
      email,
      first_name,
      last_name,
      role: 'admin'
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = req.app.locals.db;
    
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
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const pool = req.app.locals.db;
    
    // Get user basic info
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // If user is admin, get permissions
    if (user.role === 'admin') {
      const [permissions] = await pool.query(
        'SELECT * FROM user_permissions WHERE user_id = ?',
        [req.user.id]
      );
      
      if (permissions.length > 0) {
        user.permissions = permissions[0];
      }
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role (admin only)
router.put('/:userId/role', auth, async (req, res) => {
  try {
    // Check if user is admin with manage_users permission
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const pool = req.app.locals.db;
    const [adminPermissions] = await pool.query(
      'SELECT manage_users FROM user_permissions WHERE user_id = ?', 
      [req.user.id]
    );
    
    if (adminPermissions.length === 0 || !adminPermissions[0].manage_users) {
      return res.status(403).json({ 
        message: 'You do not have permission to change user roles.' 
      });
    }
    
    const userId = req.params.userId;
    const { role } = req.body;
    
    if (role !== 'customer' && role !== 'admin') {
      return res.status(400).json({ message: 'Invalid role. Must be "customer" or "admin".' });
    }
    
    // Update role
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    
    // If changing to admin, set default permissions
    if (role === 'admin') {
      // Check if permissions already exist
      const [existingPermissions] = await pool.query(
        'SELECT id FROM user_permissions WHERE user_id = ?', 
        [userId]
      );
      
      if (existingPermissions.length === 0) {
        // Set default permissions - everything except manage_admins
        await pool.query(
          `INSERT INTO user_permissions 
           (user_id, manage_orders, manage_products, manage_categories, 
            manage_users, manage_admins, view_analytics) 
           VALUES (?, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE)`, 
          [userId]
        );
      }
    }
    
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 