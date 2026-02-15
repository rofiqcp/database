const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('./database');
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

// Helper to transform Oracle row for API response
const transformRow = (row) => {
  if (!row) return null;
  return {
    id: row.ID,
    name: row.NAME,
    description: row.DESCRIPTION,
    category: row.CATEGORY,
    price: row.PRICE,
    quantity: row.QUANTITY,
    created_at: row.CREATED_AT,
    updated_at: row.UPDATED_AT
  };
};

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      'SELECT id, name, description, category, price, quantity, created_at, updated_at FROM items ORDER BY created_at DESC'
    );
    
    const transformedItems = result.rows.map(transformRow);
    sendResponse(res, true, transformedItems);
  } catch (err) {
    console.error('Error fetching items:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    // Validate numeric ID
    if (!validator.isInt(String(id), { min: 1 })) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    connection = await getConnection();
    const result = await connection.execute(
      'SELECT id, name, description, category, price, quantity, created_at, updated_at FROM items WHERE id = :id',
      { id: parseInt(id) }
    );
    
    if (result.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, transformRow(result.rows[0]));
  } catch (err) {
    console.error('Error fetching item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

// POST /api/data - Create new item
router.post('/data', async (req, res) => {
  let connection;
  try {
    const { name, description, category, price, quantity } = req.body;
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    connection = await getConnection();
    
    const result = await connection.execute(
      `INSERT INTO items (name, description, category, price, quantity, created_at, updated_at)
       VALUES (:name, :description, :category, :price, :quantity, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id INTO :id`,
      {
        name: name.trim(),
        description: description || null,
        category: category || null,
        price: price || 0,
        quantity: quantity || 0,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    
    const newId = result.outBinds.id[0];
    
    // Fetch the created item
    const created = await connection.execute(
      'SELECT id, name, description, category, price, quantity, created_at, updated_at FROM items WHERE id = :id',
      { id: newId }
    );
    
    sendResponse(res, true, transformRow(created.rows[0]), null, 201);
  } catch (err) {
    console.error('Error creating item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, description, category, price, quantity } = req.body;
    
    // Validate numeric ID
    if (!validator.isInt(String(id), { min: 1 })) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    connection = await getConnection();
    
    // Check if item exists
    const existing = await connection.execute(
      'SELECT id FROM items WHERE id = :id',
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
      `UPDATE items SET
        name = :name,
        description = :description,
        category = :category,
        price = :price,
        quantity = :quantity,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = :id`,
      {
        name: name.trim(),
        description: description || null,
        category: category || null,
        price: price || 0,
        quantity: quantity || 0,
        id: parseInt(id)
      }
    );
    
    // Fetch the updated item
    const updated = await connection.execute(
      'SELECT id, name, description, category, price, quantity, created_at, updated_at FROM items WHERE id = :id',
      { id: parseInt(id) }
    );
    
    sendResponse(res, true, transformRow(updated.rows[0]));
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    
    // Validate numeric ID
    if (!validator.isInt(String(id), { min: 1 })) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    connection = await getConnection();
    
    // Check if item exists
    const existing = await connection.execute(
      'SELECT id FROM items WHERE id = :id',
      { id: parseInt(id) }
    );
    if (existing.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    await connection.execute(
      'DELETE FROM items WHERE id = :id',
      { id: parseInt(id) }
    );
    
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

// POST /api/search - Search and filter items
router.post('/search', async (req, res) => {
  let connection;
  try {
    const { query, category, minPrice, maxPrice } = req.body;
    
    let sql = 'SELECT id, name, description, category, price, quantity, created_at, updated_at FROM items WHERE 1=1';
    const binds = {};
    
    // Text search on name and description
    if (query && !validator.isEmpty(query.trim())) {
      sql += ' AND (LOWER(name) LIKE :query OR LOWER(description) LIKE :query)';
      binds.query = '%' + query.toLowerCase() + '%';
    }
    
    // Filter by category
    if (category && !validator.isEmpty(category.trim())) {
      sql += ' AND category = :category';
      binds.category = category;
    }
    
    // Filter by price range
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      sql += ' AND price >= :minPrice';
      binds.minPrice = parseFloat(minPrice);
    }
    
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      sql += ' AND price <= :maxPrice';
      binds.maxPrice = parseFloat(maxPrice);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    connection = await getConnection();
    const result = await connection.execute(sql, binds);
    
    const transformedItems = result.rows.map(transformRow);
    sendResponse(res, true, transformedItems);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
