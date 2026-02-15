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
    const result = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    sendResponse(res, true, result.rows);
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
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, result.rows[0]);
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
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  try {
    const result = await pool.query(sql, [
      name.trim(),
      description || null,
      category || null,
      price || 0,
      quantity || 0
    ]);
    
    sendResponse(res, true, result.rows[0], null, 201);
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
    const checkResult = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    const sql = `
      UPDATE items 
      SET name = $1, description = $2, category = $3, price = $4, quantity = $5, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await pool.query(sql, [
      name.trim(),
      description || null,
      category || null,
      price || 0,
      quantity || 0,
      id
    ]);
    
    sendResponse(res, true, result.rows[0]);
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
    const checkResult = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    
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
  let paramCount = 1;
  
  if (query && !validator.isEmpty(query.trim())) {
    sql += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount + 1})`;
    params.push(`%${query}%`, `%${query}%`);
    paramCount += 2;
  }
  
  if (category && !validator.isEmpty(category.trim())) {
    sql += ` AND category = $${paramCount}`;
    params.push(category);
    paramCount += 1;
  }
  
  if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
    sql += ` AND price >= $${paramCount}`;
    params.push(minPrice);
    paramCount += 1;
  }
  
  if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
    sql += ` AND price <= $${paramCount}`;
    params.push(maxPrice);
    paramCount += 1;
  }
  
  sql += ' ORDER BY created_at DESC';
  
  try {
    const result = await pool.query(sql, params);
    sendResponse(res, true, result.rows);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
