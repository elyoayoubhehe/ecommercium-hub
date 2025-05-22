const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Orders API - Get all orders request from user:', req.user.id, 'role:', req.user.role);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('Access denied: Non-admin user tried to access all orders');
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const pool = req.app.locals.db;
    
    // Verify that the database connection is working
    if (!pool) {
      console.error('Database connection pool is not available');
      return res.status(500).json({ message: 'Database connection error' });
    }
    
    console.log('Executing query to fetch all orders...');
    
    const [rows] = await pool.query(`
      SELECT o.*, u.email, u.first_name, u.last_name 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    console.log(`Successfully fetched ${rows.length} orders`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/user', auth, async (req, res) => {
  try {
    const pool = req.app.locals.db;
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get order details
router.get('/:id', auth, async (req, res) => {
  try {
    const pool = req.app.locals.db;
    
    // First, get the order
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Check if the user is authorized to view this order
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You are not authorized to view this order.' });
    }
    
    // Get order items
    const [orderItems] = await pool.query(`
      SELECT oi.*, p.name, p.description, p.image_url, c.name as category_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE oi.order_id = ?
    `, [req.params.id]);
    
    // Get user info
    const [users] = await pool.query('SELECT id, email, first_name, last_name FROM users WHERE id = ?', [order.user_id]);
    
    const completeOrder = {
      ...order,
      items: orderItems,
      user: users.length > 0 ? users[0] : null
    };
    
    res.json(completeOrder);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  const connection = await req.app.locals.db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      items, 
      total_amount, 
      total, // Accept both total_amount and total for compatibility
      subtotal, 
      tax, 
      shipping, 
      status, 
      shipping_address, 
      billing_address = shipping_address, // Default billing to shipping if not provided
      payment_method 
    } = req.body;
    
    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({ message: 'Order items are required' });
    }
    
    if (!shipping_address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    
    if (!payment_method) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    // The actual total amount to use (prefer total_amount, fallback to total)
    const finalTotalAmount = total_amount || total || 0;
    
    // Always use the following query that includes billing_address
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (user_id, total_amount, status, shipping_address, billing_address, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, 
        finalTotalAmount,
        status || 'pending',
        JSON.stringify(shipping_address), 
        JSON.stringify(billing_address || shipping_address), // Use shipping as billing if not provided
        JSON.stringify(payment_method)
      ]
    );
    
    const orderId = orderResult.insertId;
    
    // Insert order items
    for (const item of items) {
      // Check if each order item has all required fields
      if (!item.id || item.quantity === undefined || item.price === undefined) {
        throw new Error('Order items must include id, quantity, and price');
      }
      
      await connection.query(
        `INSERT INTO order_items 
         (order_id, product_id, quantity, price, price_at_purchase) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.price, item.price]
      );
      
      // Update product stock (optional)
      if (item.updateStock) {
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.id]
        );
      }
    }
    
    await connection.commit();
    
    // Fetch the complete order
    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [orderItems] = await connection.query(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    const newOrder = {
      ...orders[0],
      items: orderItems
    };
    
    res.status(201).json(newOrder);
    
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Update order status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const pool = req.app.locals.db;
    
    // Update order status
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );
    
    // Fetch updated order
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(orders[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel order (user can cancel their own pending orders)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const pool = req.app.locals.db;
    
    // Get the order
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Check if user is authorized to cancel this order
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You cannot cancel this order.' });
    }
    
    // Check if order can be cancelled
    if (order.status !== 'pending' && order.status !== 'processing' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Only pending or processing orders can be cancelled by users.' });
    }
    
    // Update order status
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', req.params.id]
    );
    
    // Fetch updated order
    const [updatedOrders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    res.json(updatedOrders[0]);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 