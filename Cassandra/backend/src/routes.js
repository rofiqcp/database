const express = require('express');
const router = express.Router();
const client = require('./database');
const cassandra = require('cassandra-driver');
const validator = require('validator');

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

// Format row for API response
const formatRow = (row) => {
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
    const result = await client.execute('SELECT * FROM items', [], { prepare: true });
    const items = result.rows.map(formatRow);
    // Sort by created_at descending (client-side since Cassandra doesn't support ORDER BY without clustering key)
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error fetching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', async (req, res) => {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }

  try {
    const result = await client.execute(
      'SELECT * FROM items WHERE id = ?',
      [cassandra.types.Uuid.fromString(id)],
      { prepare: true }
    );

    if (result.rows.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }

    sendResponse(res, true, formatRow(result.rows[0]));
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

  const id = cassandra.types.Uuid.random();
  const now = new Date();

  const query = `
    INSERT INTO items (id, name, description, category, price, quantity, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await client.execute(query, [
      id,
      name.trim(),
      description || null,
      category || null,
      price || 0,
      quantity || 0,
      now,
      now
    ], { prepare: true });

    // Fetch the created item
    const result = await client.execute(
      'SELECT * FROM items WHERE id = ?',
      [id],
      { prepare: true }
    );

    sendResponse(res, true, formatRow(result.rows[0]), null, 201);
  } catch (err) {
    console.error('Error creating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;

  if (!UUID_REGEX.test(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }

  const uuid = cassandra.types.Uuid.fromString(id);

  try {
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

    const query = `
      UPDATE items
      SET name = ?, description = ?, category = ?, price = ?, quantity = ?,
          updated_at = ?
      WHERE id = ?
    `;

    await client.execute(query, [
      name.trim(),
      description || null,
      category || null,
      price || 0,
      quantity || 0,
      new Date(),
      uuid
    ], { prepare: true });

    // Fetch updated item
    const result = await client.execute(
      'SELECT * FROM items WHERE id = ?',
      [uuid],
      { prepare: true }
    );

    sendResponse(res, true, formatRow(result.rows[0]));
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }

  const uuid = cassandra.types.Uuid.fromString(id);

  try {
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
  const { query, category, minPrice, maxPrice } = req.body;

  try {
    let items;

    if (category && !validator.isEmpty(category.trim())) {
      // Use secondary index for category filtering
      const result = await client.execute(
        'SELECT * FROM items WHERE category = ?',
        [category],
        { prepare: true }
      );
      items = result.rows.map(formatRow);
    } else {
      // Full table scan with ALLOW FILTERING (learning purposes only)
      const result = await client.execute('SELECT * FROM items', [], { prepare: true });
      items = result.rows.map(formatRow);
    }

    // Apply additional filters client-side
    if (query && !validator.isEmpty(query.trim())) {
      const q = query.toLowerCase();
      items = items.filter(item =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

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
