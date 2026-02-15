const express = require('express');
const router = express.Router();
const { getCollection } = require('./database');
const { ObjectId } = require('mongodb');
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

// Helper to transform MongoDB document for API response
const transformDocument = (doc) => {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    category: doc.category,
    price: doc.price,
    quantity: doc.quantity,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
};

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  try {
    const collection = getCollection('items');
    const items = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    
    const transformedItems = items.map(transformDocument);
    sendResponse(res, true, transformedItems);
  } catch (err) {
    console.error('Error fetching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const collection = getCollection('items');
    const item = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!item) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, transformDocument(item));
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
    
    const collection = getCollection('items');
    const now = new Date().toISOString();
    
    const newItem = {
      name: name.trim(),
      description: description || null,
      category: category || null,
      price: price || 0,
      quantity: quantity || 0,
      created_at: now,
      updated_at: now
    };
    
    const result = await collection.insertOne(newItem);
    const createdItem = await collection.findOne({ _id: result.insertedId });
    
    sendResponse(res, true, transformDocument(createdItem), null, 201);
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
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const collection = getCollection('items');
    
    // Check if item exists
    const existingItem = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingItem) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const updateDoc = {
      $set: {
        name: name.trim(),
        description: description || null,
        category: category || null,
        price: price || 0,
        quantity: quantity || 0,
        updated_at: new Date().toISOString()
      }
    };
    
    await collection.updateOne({ _id: new ObjectId(id) }, updateDoc);
    const updatedItem = await collection.findOne({ _id: new ObjectId(id) });
    
    sendResponse(res, true, transformDocument(updatedItem));
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const collection = getCollection('items');
    
    // Check if item exists
    const existingItem = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingItem) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    await collection.deleteOne({ _id: new ObjectId(id) });
    
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
    
    const filter = {};
    
    // Text search on name and description
    if (query && !validator.isEmpty(query.trim())) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category && !validator.isEmpty(category.trim())) {
      filter.category = category;
    }
    
    // Filter by price range
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    }
    
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    }
    
    const collection = getCollection('items');
    const items = await collection
      .find(filter)
      .sort({ created_at: -1 })
      .toArray();
    
    const transformedItems = items.map(transformDocument);
    sendResponse(res, true, transformedItems);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
