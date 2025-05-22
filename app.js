const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

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

// Make pool available globally
app.locals.pool = pool;

// Import routes
console.log('Loading routes...');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  console.log('Received request to root endpoint');
  res.send('Ecommercium API is running');
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
  console.log(`POST    /api/products`);
  console.log(`GET     /api/categories`);
  console.log(`GET     /api/categories/:id`);
  console.log(`POST    /api/categories`);
  console.log(`POST    /api/users/register`);
  console.log(`POST    /api/users/login`);
  console.log(`GET     /api/users/profile`);
  console.log(`-----------------------------------------`);
}); 