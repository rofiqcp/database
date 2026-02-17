const express = require('express');
const router = express.Router();
const { db } = require('./database');
const validator = require('validator');
const { v4: uuidv4 } = require('uuid');

// Helper function for consistent API responses
const sendResponse = (res, success, data = null, error = null, status = 200) => {
  res.status(status).json({
    success,
    data,
    error,
    message: success ? 'Operation successful' : error,
    timestamp: new Date().toISOString()
  });
};

// Validation helper
const validateItem = (data) => {
  const errors = [];
  
  if (!data.name || validator.isEmpty(data.name.trim())) {
    errors.push('Name is required');
  }
  
  if (data.price !== undefined && data.price !== null && !validator.isFloat(String(data.price), { min: 0 })) {
    errors.push('Price must be a positive number');
  }
  
  if (data.stock !== undefined && data.stock !== null && !validator.isInt(String(data.stock), { min: 0 })) {
    errors.push('Stock must be a positive integer');
  }
  
  return errors;
};

// GET /api/data - Get all items with pagination
router.get('/data', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const lastKey = req.query.lastKey ? JSON.parse(decodeURIComponent(req.query.lastKey)) : null;
    
    const result = await db.scanItems(limit, lastKey);
    
    sendResponse(res, true, {
      items: result.items,
      lastEvaluatedKey: result.lastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.lastEvaluatedKey)) : null,
      hasMore: !!result.lastEvaluatedKey
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || validator.isEmpty(id.trim())) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const item = await db.getItem(id);
    
    if (!item) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, item);
  } catch (error) {
    console.error('Error fetching item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// POST /api/data - Create new item
router.post('/data', async (req, res) => {
  try {
    const { name, description, category, price, stock } = req.body;
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const newItem = {
      id: uuidv4(),
      name: name.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'Uncategorized',
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const createdItem = await db.createItem(newItem);
    sendResponse(res, true, createdItem, null, 201);
  } catch (error) {
    console.error('Error creating item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock } = req.body;
    
    if (!id || validator.isEmpty(id.trim())) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    // Check if item exists
    const existingItem = await db.getItem(id);
    if (!existingItem) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const updates = {
      name: name.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'Uncategorized',
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      updatedAt: new Date().toISOString()
    };
    
    const updatedItem = await db.updateItem(id, updates);
    sendResponse(res, true, updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || validator.isEmpty(id.trim())) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    // Check if item exists
    const existingItem = await db.getItem(id);
    if (!existingItem) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    await db.deleteItem(id);
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/category/:category - Query items by category using GSI
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const lastKey = req.query.lastKey ? JSON.parse(decodeURIComponent(req.query.lastKey)) : null;
    
    if (!category || validator.isEmpty(category.trim())) {
      return sendResponse(res, false, null, 'Category is required', 400);
    }
    
    const result = await db.queryByCategory(category, limit, lastKey);
    
    sendResponse(res, true, {
      items: result.items,
      lastEvaluatedKey: result.lastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.lastEvaluatedKey)) : null,
      hasMore: !!result.lastEvaluatedKey
    });
  } catch (error) {
    console.error('Error querying by category:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// POST /api/search - Search and filter items
router.post('/search', async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice } = req.body;
    const limit = parseInt(req.body.limit) || 50;
    const lastKey = req.body.lastKey ? JSON.parse(decodeURIComponent(req.body.lastKey)) : null;
    
    // If only category filter is provided, use GSI query for better performance
    if (category && !query && minPrice === undefined && maxPrice === undefined) {
      const result = await db.queryByCategory(category, limit, lastKey);
      return sendResponse(res, true, {
        items: result.items,
        lastEvaluatedKey: result.lastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.lastEvaluatedKey)) : null,
        hasMore: !!result.lastEvaluatedKey
      });
    }
    
    // Otherwise, use scan with filters
    const filters = {
      query: query?.trim(),
      minPrice,
      maxPrice
    };
    
    const result = await db.searchItems(filters, limit, lastKey);
    
    // Additional client-side filtering for category if needed
    let items = result.items;
    if (category && !validator.isEmpty(category.trim())) {
      items = items.filter(item => item.category === category);
    }
    
    sendResponse(res, true, {
      items,
      lastEvaluatedKey: result.lastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.lastEvaluatedKey)) : null,
      hasMore: !!result.lastEvaluatedKey
    });
  } catch (error) {
    console.error('Error searching items:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/categories - Get unique categories
router.get('/categories', async (req, res) => {
  try {
    const result = await db.scanItems(1000); // Get more items to find unique categories
    const categories = [...new Set(result.items.map(item => item.category))].filter(Boolean).sort();
    sendResponse(res, true, categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

module.exports = router;
