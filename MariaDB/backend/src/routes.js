const express = require('express');
const router = express.Router();
const pool = require('./database');
const validator = require('validator');

// Helper function for consistent API responses
const sendResponse = (res, success, data = null, error = null, status = 200) => {
  res.status(status).json({
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  });
};

// Validation helper
const validateItem = (data) => {
  const errors = [];
  if (!data.name || validator.isEmpty(data.name.trim())) {
    errors.push('Name is required');
  }
  if (data.price && !validator.isFloat(String(data.price), { min: 0 })) {
    errors.push('Price must be a positive number');
  }
  if (data.quantity && !validator.isInt(String(data.quantity), { min: 0 })) {
    errors.push('Quantity must be a positive integer');
  }
  return errors;
};

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const items = await conn.query('SELECT * FROM items ORDER BY created_at DESC');
    sendResponse(res, true, Array.from(items));
  } catch (err) {
    console.error('Error fetching items:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', async (req, res) => {
  const { id } = req.params;
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  let conn;
  try {
    conn = await pool.getConnection();
    const items = await conn.query('SELECT * FROM items WHERE id = ?', [id]);
    if (items.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    sendResponse(res, true, items[0]);
  } catch (err) {
    console.error('Error fetching item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/data - Create new item
router.post('/data', async (req, res) => {
  const { name, description, category, price, quantity } = req.body;
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return sendResponse(res, false, null, errors.join(', '), 400);
  }
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO items (name, description, category, price, quantity) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), description || null, category || null, price || 0, quantity || 0]
    );
    const newItem = await conn.query('SELECT * FROM items WHERE id = ?', [result.insertId]);
    sendResponse(res, true, newItem[0], null, 201);
  } catch (err) {
    console.error('Error creating item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return sendResponse(res, false, null, errors.join(', '), 400);
  }
  let conn;
  try {
    conn = await pool.getConnection();
    const existing = await conn.query('SELECT * FROM items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    await conn.query(
      'UPDATE items SET name = ?, description = ?, category = ?, price = ?, quantity = ? WHERE id = ?',
      [name.trim(), description || null, category || null, price || 0, quantity || 0, id]
    );
    const updated = await conn.query('SELECT * FROM items WHERE id = ?', [id]);
    sendResponse(res, true, updated[0]);
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (conn) conn.release();
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  let conn;
  try {
    conn = await pool.getConnection();
    const existing = await conn.query('SELECT * FROM items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    await conn.query('DELETE FROM items WHERE id = ?', [id]);
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/search - Search and filter items
router.post('/search', async (req, res) => {
  const { query, category, minPrice, maxPrice } = req.body;
  let sql = 'SELECT * FROM items WHERE 1=1';
  const params = [];
  
  if (query && !validator.isEmpty(query.trim())) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${query}%`, `%${query}%`);
  }
  if (category && !validator.isEmpty(category.trim())) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
    sql += ' AND price >= ?';
    params.push(minPrice);
  }
  if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
    sql += ' AND price <= ?';
    params.push(maxPrice);
  }
  sql += ' ORDER BY created_at DESC';
  
  let conn;
  try {
    conn = await pool.getConnection();
    const items = await conn.query(sql, params);
    sendResponse(res, true, Array.from(items));
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
