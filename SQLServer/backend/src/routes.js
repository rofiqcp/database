const express = require('express');
const router = express.Router();
const { getPool, sql } = require('./database');
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

// Helper to transform SQL Server row for API response
const transformRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    price: row.price,
    quantity: row.quantity,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

// GET /api/data - Get all items
router.get('/data', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .query('SELECT * FROM items ORDER BY created_at DESC');
    
    const transformedItems = result.recordset.map(transformRow);
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
    
    // Validate ID format
    if (!validator.isInt(String(id), { min: 1 })) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('SELECT * FROM items WHERE id = @id');
    
    if (result.recordset.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, transformRow(result.recordset[0]));
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
    
    const pool = getPool();
    const now = new Date().toISOString();
    
    const result = await pool.request()
      .input('name', sql.NVarChar(255), name.trim())
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('category', sql.NVarChar(100), category || null)
      .input('price', sql.Decimal(10, 2), price || 0)
      .input('quantity', sql.Int, quantity || 0)
      .input('created_at', sql.DateTime2, now)
      .input('updated_at', sql.DateTime2, now)
      .query(`
        INSERT INTO items (name, description, category, price, quantity, created_at, updated_at)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @category, @price, @quantity, @created_at, @updated_at)
      `);
    
    sendResponse(res, true, transformRow(result.recordset[0]), null, 201);
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
    
    // Validate ID format
    if (!validator.isInt(String(id), { min: 1 })) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const pool = getPool();
    
    // Check if item exists
    const existing = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('SELECT * FROM items WHERE id = @id');
    
    if (existing.recordset.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const now = new Date().toISOString();
    
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .input('name', sql.NVarChar(255), name.trim())
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .input('category', sql.NVarChar(100), category || null)
      .input('price', sql.Decimal(10, 2), price || 0)
      .input('quantity', sql.Int, quantity || 0)
      .input('updated_at', sql.DateTime2, now)
      .query(`
        UPDATE items
        SET name = @name, description = @description, category = @category,
            price = @price, quantity = @quantity, updated_at = @updated_at
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    
    sendResponse(res, true, transformRow(result.recordset[0]));
  } catch (err) {
    console.error('Error updating item:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!validator.isInt(String(id), { min: 1 })) {
      return sendResponse(res, false, null, 'Invalid ID format', 400);
    }
    
    const pool = getPool();
    
    // Check if item exists
    const existing = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('SELECT * FROM items WHERE id = @id');
    
    if (existing.recordset.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM items WHERE id = @id');
    
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
    
    const pool = getPool();
    const request = pool.request();
    const conditions = [];
    
    // Text search on name and description
    if (query && !validator.isEmpty(query.trim())) {
      request.input('query', sql.NVarChar(255), `%${query}%`);
      conditions.push('(name LIKE @query OR description LIKE @query)');
    }
    
    // Filter by category
    if (category && !validator.isEmpty(category.trim())) {
      request.input('category', sql.NVarChar(100), category);
      conditions.push('category = @category');
    }
    
    // Filter by price range
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      request.input('minPrice', sql.Decimal(10, 2), parseFloat(minPrice));
      conditions.push('price >= @minPrice');
    }
    
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      request.input('maxPrice', sql.Decimal(10, 2), parseFloat(maxPrice));
      conditions.push('price <= @maxPrice');
    }
    
    let sqlQuery = 'SELECT * FROM items';
    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }
    sqlQuery += ' ORDER BY created_at DESC';
    
    const result = await request.query(sqlQuery);
    
    const transformedItems = result.recordset.map(transformRow);
    sendResponse(res, true, transformedItems);
  } catch (err) {
    console.error('Error searching items:', err);
    sendResponse(res, false, null, err.message, 500);
  }
});

module.exports = router;
