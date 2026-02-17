const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('./database');
const validator = require('validator');

// Set output format to objects
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

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
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      'SELECT * FROM items ORDER BY created_at DESC'
    );
    sendResponse(res, true, result.rows);
  } catch (err) {
    console.error('Error fetching items:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      'SELECT * FROM items WHERE id = :id',
      { id: parseInt(id) }
    );
    
    if (result.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, result.rows[0]);
  } catch (err) {
    console.error('Error fetching item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
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
  
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO items (name, description, category, price, quantity)
       VALUES (:name, :description, :category, :price, :quantity)
       RETURNING id INTO :id`,
      {
        name: name.trim(),
        description: description || null,
        category: category || null,
        price: price || 0,
        quantity: quantity || 0,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );
    
    const newId = result.outBinds.id[0];
    
    // Fetch the created item
    const newItem = await connection.execute(
      'SELECT * FROM items WHERE id = :id',
      { id: newId }
    );
    
    sendResponse(res, true, newItem.rows[0], null, 201);
  } catch (err) {
    console.error('Error creating item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Check if item exists
    const existing = await connection.execute(
      'SELECT * FROM items WHERE id = :id',
      { id: parseInt(id) }
    );
    
    if (existing.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    await connection.execute(
      `UPDATE items 
       SET name = :name, description = :description, category = :category, 
           price = :price, quantity = :quantity, updated_at = CURRENT_TIMESTAMP
       WHERE id = :id`,
      {
        name: name.trim(),
        description: description || null,
        category: category || null,
        price: price || 0,
        quantity: quantity || 0,
        id: parseInt(id)
      },
      { autoCommit: true }
    );
    
    // Fetch updated item
    const updatedItem = await connection.execute(
      'SELECT * FROM items WHERE id = :id',
      { id: parseInt(id) }
    );
    
    sendResponse(res, true, updatedItem.rows[0]);
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Check if item exists
    const existing = await connection.execute(
      'SELECT * FROM items WHERE id = :id',
      { id: parseInt(id) }
    );
    
    if (existing.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    await connection.execute(
      'DELETE FROM items WHERE id = :id',
      { id: parseInt(id) },
      { autoCommit: true }
    );
    
    sendResponse(res, true, { id: parseInt(id), message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

// POST /api/search - Search and filter items
router.post('/search', async (req, res) => {
  const { query, category, minPrice, maxPrice } = req.body;
  
  let sql = 'SELECT * FROM items WHERE 1=1';
  const binds = {};
  
  if (query && !validator.isEmpty(query.trim())) {
    sql += ' AND (LOWER(name) LIKE :query OR LOWER(description) LIKE :query)';
    binds.query = `%${query.toLowerCase()}%`;
  }
  
  if (category && !validator.isEmpty(category.trim())) {
    sql += ' AND category = :category';
    binds.category = category;
  }
  
  if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
    sql += ' AND price >= :minPrice';
    binds.minPrice = minPrice;
  }
  
  if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
    sql += ' AND price <= :maxPrice';
    binds.maxPrice = maxPrice;
  }
  
  sql += ' ORDER BY created_at DESC';
  
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds);
    sendResponse(res, true, result.rows);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
