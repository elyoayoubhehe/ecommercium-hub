const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express(); app.use(cors()); app.use(express.json());
const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'ecommercium_hub' });
app.get('/api/products', async (req, res) => { try { const [rows] = await pool.query('SELECT * FROM products'); res.json(rows); } catch (error) { res.status(500).json({ message: error.message }); } });
app.get('/', (req, res) => { res.json({ message: 'API is running' }); });
const PORT = 5000; app.listen(PORT, () => { console.log('Server running on port ' + PORT); });
