const express = require('express');
const router = express.Router();
const hbase = require('./database');
const validator = require('validator');

const TABLE = 'items';

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

// Convert HBase row to flat item object
const rowToItem = (row) => {
  if (!row) return null;
  return {
    id: row.rowKey,
    name: row['info:name'] || '',
    description: row['info:description'] || '',
    category: row['info:category'] || '',
    price: row['meta:price'] != null ? parseFloat(row['meta:price']) : 0,
    quantity: row['meta:quantity'] != null ? parseInt(row['meta:quantity'], 10) : 0,
    created_at: row['meta:created_at'] || null,
    updated_at: row['meta:updated_at'] || null
  };
};

// Store item data into HBase column families
const putItem = (rowKey, data) => {
  const now = new Date().toISOString();

  // Column family: info (name, description, category)
  hbase.put(TABLE, rowKey, 'info', 'name', data.name.trim());
  hbase.put(TABLE, rowKey, 'info', 'description', data.description || '');
  hbase.put(TABLE, rowKey, 'info', 'category', data.category || '');

  // Column family: meta (price, quantity, timestamps)
  hbase.put(TABLE, rowKey, 'meta', 'price', data.price || 0);
  hbase.put(TABLE, rowKey, 'meta', 'quantity', data.quantity || 0);
  hbase.put(TABLE, rowKey, 'meta', 'updated_at', now);

  return now;
};

// GET /api/data - Get all items
router.get('/data', (req, res) => {
  try {
    const rows = hbase.scan(TABLE);
    const items = rows.map(rowToItem);
    items.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : 0;
      const dateB = b.created_at ? new Date(b.created_at) : 0;
      return dateB - dateA;
    });
    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error fetching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// GET /api/data/:id - Get single item by ID (row key)
router.get('/data/:id', (req, res) => {
  const { id } = req.params;

  try {
    const row = hbase.get(TABLE, id);
    if (!row) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    sendResponse(res, true, rowToItem(row));
  } catch (err) {
    console.error('Error fetching item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// POST /api/data - Create new item
router.post('/data', (req, res) => {
  const { name, description, category, price, quantity } = req.body;

  // Validation
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return sendResponse(res, false, null, errors.join(', '), 400);
  }

  try {
    const rowKey = hbase.generateRowKey();
    const now = new Date().toISOString();

    hbase.put(TABLE, rowKey, 'meta', 'created_at', now);
    putItem(rowKey, { name, description, category, price, quantity });

    const newItem = rowToItem(hbase.get(TABLE, rowKey));
    sendResponse(res, true, newItem, null, 201);
  } catch (err) {
    console.error('Error creating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;

  try {
    const existingRow = hbase.get(TABLE, id);
    if (!existingRow) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }

    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }

    putItem(id, { name, description, category, price, quantity });

    const updatedItem = rowToItem(hbase.get(TABLE, id));
    sendResponse(res, true, updatedItem);
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', (req, res) => {
  const { id } = req.params;

  try {
    const existingRow = hbase.get(TABLE, id);
    if (!existingRow) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }

    hbase.delete(TABLE, id);
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// POST /api/search - Search and filter items
router.post('/search', (req, res) => {
  const { query, category, minPrice, maxPrice } = req.body;

  try {
    let items = hbase.scan(TABLE).map(rowToItem);

    if (query && !validator.isEmpty(query.trim())) {
      const q = query.toLowerCase();
      items = items.filter(item =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    if (category && !validator.isEmpty(category.trim())) {
      items = items.filter(item => item.category === category);
    }

    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      items = items.filter(item => item.price >= parseFloat(minPrice));
    }

    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      items = items.filter(item => item.price <= parseFloat(maxPrice));
    }

    items.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : 0;
      const dateB = b.created_at ? new Date(b.created_at) : 0;
      return dateB - dateA;
    });

    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
