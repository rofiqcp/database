const express = require('express');
const router = express.Router();
const { getDb } = require('./database');
const validator = require('validator');

const sendResponse = (res, success, data = null, error = null, status = 200) => {
  res.status(status).json({
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  });
};

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

// Format document to match expected API response format
const formatItem = (doc) => ({
  id: doc._id,
  name: doc.name,
  description: doc.description,
  category: doc.category,
  price: doc.price,
  quantity: doc.quantity,
  created_at: doc.created_at,
  updated_at: doc.updated_at,
  _rev: doc._rev
});

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  try {
    const db = getDb();
    const result = await db.find({
      selector: { type: 'item' },
      sort: [{ created_at: 'desc' }],
      limit: 1000
    });
    const items = result.docs.map(formatItem);
    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error fetching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// GET /api/data/:id - Get single item
router.get('/data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    const doc = await db.get(id);
    if (doc.type !== 'item') {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    sendResponse(res, true, formatItem(doc));
  } catch (err) {
    if (err.statusCode === 404) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    console.error('Error fetching item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// POST /api/data - Create new item
router.post('/data', async (req, res) => {
  const { name, description, category, price, quantity } = req.body;
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return sendResponse(res, false, null, errors.join(', '), 400);
  }
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const doc = {
      type: 'item',
      name: name.trim(),
      description: description || null,
      category: category || null,
      price: price || 0,
      quantity: quantity || 0,
      created_at: now,
      updated_at: now
    };
    const result = await db.insert(doc);
    const newDoc = await db.get(result.id);
    sendResponse(res, true, formatItem(newDoc), null, 201);
  } catch (err) {
    console.error('Error creating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// PUT /api/data/:id - Update item
router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return sendResponse(res, false, null, errors.join(', '), 400);
  }
  try {
    const db = getDb();
    const existing = await db.get(id);
    if (existing.type !== 'item') {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    const updatedDoc = {
      ...existing,
      name: name.trim(),
      description: description || null,
      category: category || null,
      price: price || 0,
      quantity: quantity || 0,
      updated_at: new Date().toISOString()
    };
    await db.insert(updatedDoc);
    const result = await db.get(id);
    sendResponse(res, true, formatItem(result));
  } catch (err) {
    if (err.statusCode === 404) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    const doc = await db.get(id);
    if (doc.type !== 'item') {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    await db.destroy(id, doc._rev);
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (err) {
    if (err.statusCode === 404) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    console.error('Error deleting item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// POST /api/search - Search items
router.post('/search', async (req, res) => {
  const { query, category, minPrice, maxPrice } = req.body;
  try {
    const db = getDb();
    const selector = { type: 'item' };
    
    if (category && !validator.isEmpty(category.trim())) {
      selector.category = category;
    }
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      selector.price = selector.price || {};
      selector.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      selector.price = selector.price || {};
      selector.price.$lte = parseFloat(maxPrice);
    }
    
    const result = await db.find({
      selector,
      limit: 1000
    });
    
    let items = result.docs.map(formatItem);
    
    // Text search filter (CouchDB Mango doesn't support full-text easily)
    if (query && !validator.isEmpty(query.trim())) {
      const q = query.toLowerCase();
      items = items.filter(item =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    
    // Sort by created_at DESC
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
