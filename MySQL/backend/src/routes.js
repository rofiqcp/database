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
  try {
    const [rows] = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    sendResponse(res, true, rows);
  } catch (err) {
    console.error('Error fetching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  try {
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, rows[0]);
  } catch (err) {
    console.error('Error fetching item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// POST /api/data - Create new item
router.post('/data', async (req, res) => {
  const { name, description, category, price, quantity } = req.body;
  
  // Validation
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return sendResponse(res, false, null, errors.join(', '), 400);
  }
  
  const sql = `
    INSERT INTO items (name, description, category, price, quantity)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  try {
    const [result] = await pool.query(sql, [
      name.trim(),
      description || null,
      category || null,
      price || 0,
      quantity || 0
    ]);
    
    // Fetch the newly created item
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [result.insertId]);
    
    sendResponse(res, true, rows[0], null, 201);
  } catch (err) {
    console.error('Error creating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  // Validation
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return sendResponse(res, false, null, errors.join(', '), 400);
  }
  
  try {
    // Check if item exists
    const [checkRows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    
    if (checkRows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    const sql = `
      UPDATE items 
      SET name = ?, description = ?, category = ?, price = ?, quantity = ?
      WHERE id = ?
    `;
    
    await pool.query(sql, [
      name.trim(),
      description || null,
      category || null,
      price || 0,
      quantity || 0,
      id
    ]);
    
    // Fetch updated item
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    
    sendResponse(res, true, rows[0]);
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  try {
    // Check if item exists
    const [checkRows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    
    if (checkRows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    await pool.query('DELETE FROM items WHERE id = ?', [id]);
    
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// POST /api/search - Search and filter items
router.post('/search', async (req, res) => {
  const { query, category, minPrice, maxPrice } = req.body;
  
  let sql = 'SELECT * FROM items WHERE 1=1';
  const params = [];
  
  if (query && !validator.isEmpty(query.trim())) {
    sql += ` AND (name LIKE ? OR description LIKE ?)`;
    params.push(`%${query}%`, `%${query}%`);
  }
  
  if (category && !validator.isEmpty(category.trim())) {
    sql += ` AND category = ?`;
    params.push(category);
  }
  
  if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
    sql += ` AND price >= ?`;
    params.push(minPrice);
  }
  
  if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
    sql += ` AND price <= ?`;
    params.push(maxPrice);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  try {
    const [rows] = await pool.query(sql, params);
    sendResponse(res, true, rows);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
