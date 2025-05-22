const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Add verbose logging for environment variables
console.log('Environment variables loaded:');
console.log('- PORT:', process.env.PORT || '5000 (default)');
console.log('- DB_HOST:', process.env.DB_HOST || 'localhost (default)');
console.log('- DB_USER:', process.env.DB_USER || 'root (default)');
console.log('- DB_DATABASE:', process.env.DB_DATABASE || 'ecommercium_hub (default)');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded (hidden for security)' : 'NOT LOADED - THIS WILL CAUSE AUTH ISSUES');

console.log('Starting Ecommercium API server...');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ecommercium_hub'
});

console.log('Database config:', {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_DATABASE || 'ecommercium_hub'
});

// Make db available globally
app.locals.db = pool;

// Import routes
console.log('Loading routes...');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const permissionsRoutes = require('./routes/permissions');

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/permissions', permissionsRoutes);

// Test route
app.get('/', (req, res) => {
  console.log('Received request to root endpoint');
  res.send('Ecommercium API is running');
});

// Debug endpoint for checking authentication
app.get('/api/debug/auth', (req, res) => {
  console.log('Auth debug endpoint called');
  const authHeader = req.header('Authorization');
  console.log('Authorization header:', authHeader);
  
  if (!authHeader) {
    return res.status(401).json({ 
      message: 'No Authorization header found',
      headers: req.headers,
    });
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      authenticated: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      },
      token_preview: token.substring(0, 20) + '...'
    });
  } catch (error) {
    res.status(401).json({ 
      authenticated: false, 
      error: error.message,
      token_received: authHeader
    });
  }
});

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`🚀 Ecommercium API server running on port ${PORT}`);
  console.log(`-----------------------------------------`);
  console.log(`Available endpoints:`);
  console.log(`GET     /`);
  console.log(`GET     /api/products`);
  console.log(`GET     /api/products/:id`);
  console.log(`POST    /api/products  (requires auth)`);
  console.log(`PUT     /api/products/:id  (requires auth)`);
  console.log(`DELETE  /api/products/:id  (requires auth)`);
  console.log(`GET     /api/categories`);
  console.log(`GET     /api/categories/:id`);
  console.log(`POST    /api/categories  (requires auth)`);
  console.log(`PUT     /api/categories/:id  (requires auth)`);
  console.log(`DELETE  /api/categories/:id  (requires auth)`);
  console.log(`GET     /api/users      (admin only)`);
  console.log(`POST    /api/users/register`);
  console.log(`POST    /api/users/login`);
  console.log(`GET     /api/users/profile  (requires auth)`);
  console.log(`GET     /api/wishlist  (requires auth)`);
  console.log(`POST    /api/wishlist  (requires auth)`);
  console.log(`DELETE  /api/wishlist/:product_id  (requires auth)`);
  console.log(`DELETE  /api/wishlist  (requires auth)`);
  console.log(`GET     /api/orders  (admin only)`);
  console.log(`GET     /api/orders/user  (requires auth)`);
  console.log(`GET     /api/orders/:id  (requires auth)`);
  console.log(`POST    /api/orders  (requires auth)`);
  console.log(`PUT     /api/orders/:id/status  (admin only)`);
  console.log(`PUT     /api/orders/:id/cancel  (requires auth)`);
  console.log(`GET     /api/debug/auth`);
  console.log(`-----------------------------------------`);
}); 