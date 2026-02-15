const express = require('express');
const router = express.Router();
const { getClient } = require('./database');
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
    const client = getClient();
    const ids = await client.sMembers('items:index');
    
    if (ids.length === 0) {
      return sendResponse(res, true, []);
    }

    const keys = ids.map(id => `item:${id}`);
    const values = await client.mGet(keys);
    
    const items = values
      .filter(val => val !== null)
      .map(val => JSON.parse(val))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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
    
    if (!validator.isInt(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }

    const client = getClient();
    const data = await client.get(`item:${id}`);
    
    if (!data) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, JSON.parse(data));
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
    const id = await client.incr('item:counter');
    const now = new Date().toISOString();
    
    const item = {
      id,
      name: name.trim(),
      description: description || null,
      category: category || null,
      price: price || 0,
      quantity: quantity || 0,
      created_at: now,
      updated_at: now
    };

    await client.set(`item:${id}`, JSON.stringify(item));
    await client.sAdd('items:index', String(id));

    sendResponse(res, true, item, null, 201);
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
    
    if (!validator.isInt(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }

    const client = getClient();
    const existing = await client.get(`item:${id}`);
    
    if (!existing) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }

    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }

    const existingItem = JSON.parse(existing);
    const updatedItem = {
      id: existingItem.id,
      name: name.trim(),
      description: description || null,
      category: category || null,
      price: price || 0,
      quantity: quantity || 0,
      created_at: existingItem.created_at,
      updated_at: new Date().toISOString()
    };

    await client.set(`item:${id}`, JSON.stringify(updatedItem));

    sendResponse(res, true, updatedItem);
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validator.isInt(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }

    const client = getClient();
    const existing = await client.get(`item:${id}`);
    
    if (!existing) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }

    await client.del(`item:${id}`);
    await client.sRem('items:index', String(id));

    sendResponse(res, true, { id: parseInt(id), message: 'Item deleted successfully' });
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
    const ids = await client.sMembers('items:index');

    if (ids.length === 0) {
      return sendResponse(res, true, []);
    }

    const keys = ids.map(id => `item:${id}`);
    const values = await client.mGet(keys);

    let items = values
      .filter(val => val !== null)
      .map(val => JSON.parse(val));

    // Filter in-memory (Redis doesn't have built-in text search for this pattern)
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
      items = items.filter(item => item.price >= minPrice);
    }

    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      items = items.filter(item => item.price <= maxPrice);
    }

    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
