const express = require('express');
const router = express.Router();
const client = require('./database');
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

// Helper to format item from Redis hash
const formatItem = (id, hash) => {
  if (!hash || Object.keys(hash).length === 0) return null;
  
  return {
    id: parseInt(id),
    name: hash.name || '',
    description: hash.description || null,
    category: hash.category || null,
    price: hash.price ? parseFloat(hash.price) : 0,
    quantity: hash.quantity ? parseInt(hash.quantity) : 0,
    created_at: hash.created_at || new Date().toISOString(),
    updated_at: hash.updated_at || new Date().toISOString()
  };
};

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  try {
    // Get all item IDs from the set
    const itemIds = await client.sMembers('items:ids');
    
    if (itemIds.length === 0) {
      return sendResponse(res, true, []);
    }
    
    // Fetch all items
    const items = [];
    for (const id of itemIds) {
      const itemData = await client.hGetAll(`items:${id}`);
      const item = formatItem(id, itemData);
      if (item) items.push(item);
    }
    
    // Sort by created_at descending
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
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  try {
    // Check if item exists in the set
    const exists = await client.sIsMember('items:ids', id);
    if (!exists) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Get item data
    const itemData = await client.hGetAll(`items:${id}`);
    const item = formatItem(id, itemData);
    
    if (!item) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, item);
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
  
  try {
    // Get next ID and increment
    const id = await client.incr('items:next_id');
    
    const now = new Date().toISOString();
    const itemData = {
      name: name.trim(),
      description: description || '',
      category: category || '',
      price: price || 0,
      quantity: quantity || 0,
      created_at: now,
      updated_at: now
    };
    
    // Store item as hash
    await client.hSet(`items:${id}`, itemData);
    
    // Add ID to the set of all item IDs
    await client.sAdd('items:ids', id.toString());
    
    // Return created item
    const item = formatItem(id, itemData);
    sendResponse(res, true, item, null, 201);
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
    const exists = await client.sIsMember('items:ids', id);
    if (!exists) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Get existing item to preserve created_at
    const existingData = await client.hGetAll(`items:${id}`);
    
    const itemData = {
      name: name.trim(),
      description: description || '',
      category: category || '',
      price: price || 0,
      quantity: quantity || 0,
      created_at: existingData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Update item hash
    await client.hSet(`items:${id}`, itemData);
    
    // Return updated item
    const item = formatItem(id, itemData);
    sendResponse(res, true, item);
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
    const exists = await client.sIsMember('items:ids', id);
    if (!exists) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Delete item hash
    await client.del(`items:${id}`);
    
    // Remove ID from set
    await client.sRem('items:ids', id);
    
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
    // Get all item IDs
    const itemIds = await client.sMembers('items:ids');
    
    if (itemIds.length === 0) {
      return sendResponse(res, true, []);
    }
    
    // Fetch all items
    const items = [];
    for (const id of itemIds) {
      const itemData = await client.hGetAll(`items:${id}`);
      const item = formatItem(id, itemData);
      if (item) items.push(item);
    }
    
    // Filter items based on search criteria
    let filteredItems = items;
    
    // Text search in name and description
    if (query && !validator.isEmpty(query.trim())) {
      const searchLower = query.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by category
    if (category && !validator.isEmpty(category.trim())) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    // Filter by price range
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      filteredItems = filteredItems.filter(item => item.price >= parseFloat(minPrice));
    }
    
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      filteredItems = filteredItems.filter(item => item.price <= parseFloat(maxPrice));
    }
    
    // Sort by created_at descending
    filteredItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    sendResponse(res, true, filteredItems);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
