const express = require('express');
const router = express.Router();
const { getRow, scanAll, putRow, deleteRow } = require('./database');
const { v4: uuidv4 } = require('uuid');
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

// Validate UUID format
const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  try {
    const items = await scanAll();
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
    
    if (!isValidUUID(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const item = await getRow(id);
    
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
  try {
    const { name, description, category, price, quantity } = req.body;
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const rowKey = uuidv4();
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
    
    await putRow(rowKey, itemData);
    
    const createdItem = {
      id: rowKey,
      ...itemData,
      price: parseFloat(itemData.price) || 0,
      quantity: parseInt(itemData.quantity, 10) || 0
    };
    
    sendResponse(res, true, createdItem, null, 201);
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
    
    if (!isValidUUID(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    // Check if item exists
    const existingItem = await getRow(id);
    if (!existingItem) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const itemData = {
      name: name.trim(),
      description: description || '',
      category: category || '',
      price: price || 0,
      quantity: quantity || 0,
      updated_at: new Date().toISOString()
    };
    
    await putRow(id, itemData);
    
    const updatedItem = await getRow(id);
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
    
    if (!isValidUUID(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    // Check if item exists
    const existingItem = await getRow(id);
    if (!existingItem) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    await deleteRow(id);
    
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
    
    // Scan all items and filter in-memory (HBase has limited query support)
    let items = await scanAll();
    
    // Text search on name and description
    if (query && !validator.isEmpty(query.trim())) {
      const searchTerm = query.toLowerCase();
      items = items.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by category
    if (category && !validator.isEmpty(category.trim())) {
      items = items.filter(item => item.category === category);
    }
    
    // Filter by price range
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      items = items.filter(item => {
        const price = parseFloat(item.price) || 0;
        return price >= parseFloat(minPrice);
      });
    }
    
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      items = items.filter(item => {
        const price = parseFloat(item.price) || 0;
        return price <= parseFloat(maxPrice);
      });
    }
    
    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
