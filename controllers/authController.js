const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const pool = req.app.locals.db;
    
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, 'customer']
    );
    
    const userId = result.insertId;
    
    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'customer' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: userId,
        firstName,
        lastName,
        email,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login an existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = req.app.locals.db;
    
    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    console.log(`Login attempt for email: ${email}`);
    console.log(`Users found: ${users.length}`);
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    console.log(`User found with ID: ${user.id}, role: ${user.role}`);
    
    // Check password
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password match result: ${isMatch}`);
    
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
      
      console.log(`JWT token generated successfully for user: ${user.id}`);
      
      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Password comparison error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user info
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = req.app.locals.db;
    
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, email, role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, password } = req.body;
    const pool = req.app.locals.db;
    
    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update basic info
    if (firstName || lastName) {
      await pool.query(
        'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
        [
          firstName || users[0].first_name,
          lastName || users[0].last_name,
          userId
        ]
      );
    }
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
    }
    
    // Get updated user
    const [updatedUsers] = await pool.query(
      'SELECT id, first_name, last_name, email, role FROM users WHERE id = ?',
      [userId]
    );
    
    const updatedUser = updatedUsers[0];
    
    res.json({
      user: {
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};