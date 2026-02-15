const express = require('express');
const router = express.Router();
const { getClient } = require('./database');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const cassandra = require('cassandra-driver');

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

// Helper to validate UUID format
const isValidUuid = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Helper to transform Cassandra row for API response
const transformRow = (row) => {
  if (!row) return null;
  return {
    id: row.id.toString(),
    name: row.name,
    description: row.description,
    category: row.category,
    price: row.price ? parseFloat(row.price.toString()) : 0,
    quantity: row.quantity || 0,
    created_at: row.created_at ? row.created_at.toISOString() : null,
    updated_at: row.updated_at ? row.updated_at.toISOString() : null
  };
};

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  try {
    const client = getClient();
    const result = await client.execute(
      'SELECT * FROM items',
      [],
      { prepare: true }
    );
    
    const items = result.rows.map(transformRow);
    // Sort by created_at descending (client-side since Cassandra requires clustering key for ORDER BY)
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error fetching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!isValidUuid(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const client = getClient();
    const result = await client.execute(
      'SELECT * FROM items WHERE id = ?',
      [cassandra.types.Uuid.fromString(id)],
      { prepare: true }
    );
    
    if (result.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, transformRow(result.rows[0]));
  } catch (err) {
    console.error('Error fetching item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// POST /api/data - Create new item
router.post('/data', async (req, res) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const client = getClient();
    const id = cassandra.types.Uuid.fromString(uuidv4());
    const now = new Date();
    const itemPrice = price ? new cassandra.types.BigDecimal.fromString(String(price)) : new cassandra.types.BigDecimal.fromString('0');
    
    await client.execute(
      'INSERT INTO items (id, name, description, category, price, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name.trim(), description || null, category || null, itemPrice, quantity || 0, now, now],
      { prepare: true }
    );
    
    // Fetch the created item
    const result = await client.execute(
      'SELECT * FROM items WHERE id = ?',
      [id],
      { prepare: true }
    );
    
    sendResponse(res, true, transformRow(result.rows[0]), null, 201);
  } catch (err) {
    console.error('Error creating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, quantity } = req.body;
    
    // Validate UUID format
    if (!isValidUuid(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const client = getClient();
    const uuid = cassandra.types.Uuid.fromString(id);
    
    // Check if item exists
    const existing = await client.execute(
      'SELECT * FROM items WHERE id = ?',
      [uuid],
      { prepare: true }
    );
    
    if (existing.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const now = new Date();
    const itemPrice = price ? new cassandra.types.BigDecimal.fromString(String(price)) : new cassandra.types.BigDecimal.fromString('0');
    
    await client.execute(
      'UPDATE items SET name = ?, description = ?, category = ?, price = ?, quantity = ?, updated_at = ? WHERE id = ?',
      [name.trim(), description || null, category || null, itemPrice, quantity || 0, now, uuid],
      { prepare: true }
    );
    
    // Fetch the updated item
    const result = await client.execute(
      'SELECT * FROM items WHERE id = ?',
      [uuid],
      { prepare: true }
    );
    
    sendResponse(res, true, transformRow(result.rows[0]));
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format
    if (!isValidUuid(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const client = getClient();
    const uuid = cassandra.types.Uuid.fromString(id);
    
    // Check if item exists
    const existing = await client.execute(
      'SELECT * FROM items WHERE id = ?',
      [uuid],
      { prepare: true }
    );
    
    if (existing.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    await client.execute(
      'DELETE FROM items WHERE id = ?',
      [uuid],
      { prepare: true }
    );
    
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// POST /api/search - Search and filter items
router.post('/search', async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice } = req.body;
    
    const client = getClient();
    let items;
    
    // If category filter is provided, use the index
    if (category && !validator.isEmpty(category.trim())) {
      const result = await client.execute(
        'SELECT * FROM items WHERE category = ?',
        [category],
        { prepare: true }
      );
      items = result.rows.map(transformRow);
    } else {
      // Fetch all items and filter client-side
      const result = await client.execute(
        'SELECT * FROM items',
        [],
        { prepare: true }
      );
      items = result.rows.map(transformRow);
    }
    
    // Apply text search filter (client-side)
    if (query && !validator.isEmpty(query.trim())) {
      const lowerQuery = query.toLowerCase();
      items = items.filter(item =>
        (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
        (item.description && item.description.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Apply price range filter (client-side)
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      items = items.filter(item => item.price >= parseFloat(minPrice));
    }
    
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      items = items.filter(item => item.price <= parseFloat(maxPrice));
    }
    
    // Sort by created_at descending
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
