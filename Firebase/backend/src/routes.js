const express = require('express');
const router = express.Router();
const database = require('./database');
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

// Middleware for API key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return sendResponse(res, false, null, 'API key is required', 401);
  }
  
  if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
    return sendResponse(res, false, null, 'Invalid API key', 403);
  }
  
  next();
};

// Validation helper
const validateItem = (data) => {
  const errors = [];
  
  if (!data.name || validator.isEmpty(data.name.trim())) {
    errors.push('Name is required');
  }
  
  if (data.price !== undefined && !validator.isFloat(String(data.price), { min: 0 })) {
    errors.push('Price must be a positive number');
  }
  
  if (data.stock !== undefined && !validator.isInt(String(data.stock), { min: 0 })) {
    errors.push('Stock must be a positive integer');
  }
  
  if (data.featured !== undefined && typeof data.featured !== 'boolean') {
    errors.push('Featured must be a boolean');
  }
  
  return errors;
};

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  try {
    const items = await database.getAllItems();
    sendResponse(res, true, items);
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
    
    const item = await database.getItemById(id);
    
    if (!item) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, item);
  } catch (error) {
    console.error('Error fetching item:', error);
    
    if (error.message.includes('not found')) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, false, null, error.message, 500);
  }
});

// POST /api/data - Create new item
router.post('/data', validateApiKey, async (req, res) => {
  try {
    const { name, description, category, price, stock, featured, userId } = req.body;
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const itemData = {
      name: name.trim(),
      description: description || '',
      category: category || '',
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      featured: featured || false,
      userId: userId || 'anonymous'
    };
    
    const newItem = await database.createItem(itemData);
    sendResponse(res, true, newItem, null, 201);
  } catch (error) {
    console.error('Error creating item:', error);
    
    if (error.message.includes('permission-denied')) {
      return sendResponse(res, false, null, 'Permission denied', 403);
    }
    
    sendResponse(res, false, null, error.message, 500);
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock, featured, userId } = req.body;
    
    if (!id || validator.isEmpty(id.trim())) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const updateData = {
      name: name.trim(),
      description: description || '',
      category: category || '',
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      featured: featured || false,
      userId: userId || 'anonymous'
    };
    
    const updatedItem = await database.updateItem(id, updateData);
    
    if (!updatedItem) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    
    if (error.message.includes('not found')) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    if (error.message.includes('permission-denied')) {
      return sendResponse(res, false, null, 'Permission denied', 403);
    }
    
    sendResponse(res, false, null, error.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || validator.isEmpty(id.trim())) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const result = await database.deleteItem(id);
    
    if (!result) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    
    if (error.message.includes('not found')) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    if (error.message.includes('permission-denied')) {
      return sendResponse(res, false, null, 'Permission denied', 403);
    }
    
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/category/:category - Get items by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category || validator.isEmpty(category.trim())) {
      return sendResponse(res, false, null, 'Category is required', 400);
    }
    
    const items = await database.getItemsByCategory(category);
    sendResponse(res, true, items);
  } catch (error) {
    console.error('Error fetching items by category:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// POST /api/search - Search and filter items
router.post('/search', async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, featured } = req.body;
    
    const filters = {};
    
    if (query && !validator.isEmpty(query.trim())) {
      filters.query = query.trim();
    }
    
    if (category && !validator.isEmpty(category.trim())) {
      filters.category = category.trim();
    }
    
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      filters.minPrice = parseFloat(minPrice);
    }
    
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      filters.maxPrice = parseFloat(maxPrice);
    }
    
    if (featured !== undefined) {
      filters.featured = Boolean(featured);
    }
    
    const items = await database.searchItems(filters);
    sendResponse(res, true, items);
  } catch (error) {
    console.error('Error searching items:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

module.exports = router;
