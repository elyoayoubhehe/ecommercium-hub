import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './api/routes/products';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 