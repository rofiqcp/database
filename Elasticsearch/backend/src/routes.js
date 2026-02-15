const express = require('express');
const router = express.Router();
const { client, index } = require('./database');
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
    const result = await client.search({
      index,
      body: {
        query: { match_all: {} },
        sort: [{ created_at: { order: 'desc' } }],
        size: 1000
      }
    });

    const items = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    sendResponse(res, true, items);
  } catch (error) {
    console.error('Error fetching items:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.get({ index, id });
    const item = { id: result._id, ...result._source };
    sendResponse(res, true, item);
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    console.error('Error fetching item:', error);
    sendResponse(res, false, null, error.message, 500);
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
    const doc = {
      name: name.trim(),
      description: description || null,
      category: category || null,
      price: price || 0,
      quantity: quantity || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await client.index({
      index,
      body: doc,
      refresh: 'wait_for'
    });

    const newItem = { id: result._id, ...doc };
    sendResponse(res, true, newItem, null, 201);
  } catch (error) {
    console.error('Error creating item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;

  // Check if item exists
  try {
    await client.get({ index, id });
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    console.error('Error checking item:', error);
    return sendResponse(res, false, null, error.message, 500);
  }

  // Validation
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return sendResponse(res, false, null, errors.join(', '), 400);
  }

  try {
    const doc = {
      name: name.trim(),
      description: description || null,
      category: category || null,
      price: price || 0,
      quantity: quantity || 0,
      updated_at: new Date().toISOString()
    };

    await client.update({
      index,
      id,
      body: { doc },
      refresh: 'wait_for'
    });

    // Fetch updated item
    const updated = await client.get({ index, id });
    const updatedItem = { id: updated._id, ...updated._source };
    sendResponse(res, true, updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;

  // Check if item exists
  try {
    await client.get({ index, id });
  } catch (error) {
    if (error.meta && error.meta.statusCode === 404) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    console.error('Error checking item:', error);
    return sendResponse(res, false, null, error.message, 500);
  }

  try {
    await client.delete({ index, id, refresh: 'wait_for' });
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// POST /api/search - Search and filter items
router.post('/search', async (req, res) => {
  const { query, category, minPrice, maxPrice } = req.body;

  try {
    const must = [];
    const filter = [];

    if (query && !validator.isEmpty(query.trim())) {
      must.push({
        multi_match: {
          query: query.trim(),
          fields: ['name', 'description'],
          fuzziness: 'AUTO'
        }
      });
    }

    if (category && !validator.isEmpty(category.trim())) {
      filter.push({ term: { category: category } });
    }

    const rangeFilter = {};
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      rangeFilter.gte = minPrice;
    }
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      rangeFilter.lte = maxPrice;
    }
    if (Object.keys(rangeFilter).length > 0) {
      filter.push({ range: { price: rangeFilter } });
    }

    const body = {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter
        }
      },
      sort: [{ created_at: { order: 'desc' } }],
      size: 1000
    };

    const result = await client.search({ index, body });

    const items = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    sendResponse(res, true, items);
  } catch (error) {
    console.error('Error searching items:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

module.exports = router;
