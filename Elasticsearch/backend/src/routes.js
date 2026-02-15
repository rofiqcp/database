const express = require('express');
const router = express.Router();
const { client, indexName } = require('./database');
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

const formatItem = (hit) => ({
  id: hit._id,
  ...hit._source
});

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  try {
    const result = await client.search({
      index: indexName,
      body: {
        query: { match_all: {} },
        sort: [{ created_at: { order: 'desc' } }],
        size: 1000
      }
    });
    const items = result.hits.hits.map(formatItem);
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
    const result = await client.get({
      index: indexName,
      id: id
    });
    sendResponse(res, true, formatItem(result));
  } catch (err) {
    if (err.meta && err.meta.statusCode === 404) {
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
    const now = new Date().toISOString();
    const doc = {
      name: name.trim(),
      description: description || null,
      category: category || null,
      price: price || 0,
      quantity: quantity || 0,
      created_at: now,
      updated_at: now
    };
    const result = await client.index({
      index: indexName,
      body: doc,
      refresh: 'true'
    });
    const newDoc = await client.get({ index: indexName, id: result._id });
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
    // Check if exists
    try {
      await client.get({ index: indexName, id: id });
    } catch (getErr) {
      if (getErr.meta && getErr.meta.statusCode === 404) {
        return sendResponse(res, false, null, 'Item not found', 404);
      }
      throw getErr;
    }
    
    await client.update({
      index: indexName,
      id: id,
      body: {
        doc: {
          name: name.trim(),
          description: description || null,
          category: category || null,
          price: price || 0,
          quantity: quantity || 0,
          updated_at: new Date().toISOString()
        }
      },
      refresh: 'true'
    });
    const updated = await client.get({ index: indexName, id: id });
    sendResponse(res, true, formatItem(updated));
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    try {
      await client.get({ index: indexName, id: id });
    } catch (getErr) {
      if (getErr.meta && getErr.meta.statusCode === 404) {
        return sendResponse(res, false, null, 'Item not found', 404);
      }
      throw getErr;
    }
    
    await client.delete({
      index: indexName,
      id: id,
      refresh: 'true'
    });
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Error deleting item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// POST /api/search - Search items (Elasticsearch's strength!)
router.post('/search', async (req, res) => {
  const { query, category, minPrice, maxPrice } = req.body;
  try {
    const must = [];
    const filter = [];
    
    if (query && !validator.isEmpty(query.trim())) {
      must.push({
        multi_match: {
          query: query,
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
      rangeFilter.gte = parseFloat(minPrice);
    }
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      rangeFilter.lte = parseFloat(maxPrice);
    }
    if (Object.keys(rangeFilter).length > 0) {
      filter.push({ range: { price: rangeFilter } });
    }
    
    const body = {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter: filter
        }
      },
      sort: [{ created_at: { order: 'desc' } }],
      size: 1000
    };
    
    const result = await client.search({
      index: indexName,
      body: body
    });
    
    const items = result.hits.hits.map(formatItem);
    sendResponse(res, true, items);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
