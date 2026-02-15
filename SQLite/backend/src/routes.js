const express = require('express');
const router = express.Router();
const db = require('./database');
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
router.get('/data', (req, res) => {
  db.all('SELECT * FROM items ORDER BY created_at DESC', [], (err, items) => {
    if (err) {
      console.error('Error fetching items:', err);
      return sendResponse(res, false, null, err.message, 500);
    }
    sendResponse(res, true, items);
  });
});

// GET /api/data/:id - Get single item by ID
router.get('/data/:id', (req, res) => {
  const { id } = req.params;
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, item) => {
    if (err) {
      console.error('Error fetching item:', err);
      return sendResponse(res, false, null, err.message, 500);
    }
    
    if (!item) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    sendResponse(res, true, item);
  });
});

// POST /api/data - Create new item
router.post('/data', (req, res) => {
  const { name, description, category, price, quantity } = req.body;
  
  // Validation
  const errors = validateItem(req.body);
  if (errors.length > 0) {
    return sendResponse(res, false, null, errors.join(', '), 400);
  }
  
  const sql = `
    INSERT INTO items (name, description, category, price, quantity)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [
    name.trim(),
    description || null,
    category || null,
    price || 0,
    quantity || 0
  ], function(err) {
    if (err) {
      console.error('Error creating item:', err);
      return sendResponse(res, false, null, err.message, 500);
    }
    
    // Fetch the created item
    db.get('SELECT * FROM items WHERE id = ?', [this.lastID], (err, newItem) => {
      if (err) {
        console.error('Error fetching new item:', err);
        return sendResponse(res, false, null, err.message, 500);
      }
      sendResponse(res, true, newItem, null, 201);
    });
  });
});

// PUT /api/data/:id - Update existing item
router.put('/data/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, quantity } = req.body;
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  // Check if item exists
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, existingItem) => {
    if (err) {
      console.error('Error checking item:', err);
      return sendResponse(res, false, null, err.message, 500);
    }
    
    if (!existingItem) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const sql = `
      UPDATE items 
      SET name = ?, description = ?, category = ?, price = ?, quantity = ?, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.run(sql, [
      name.trim(),
      description || null,
      category || null,
      price || 0,
      quantity || 0,
      id
    ], (err) => {
      if (err) {
        console.error('Error updating item:', err);
        return sendResponse(res, false, null, err.message, 500);
      }
      
      // Fetch updated item
      db.get('SELECT * FROM items WHERE id = ?', [id], (err, updatedItem) => {
        if (err) {
          console.error('Error fetching updated item:', err);
          return sendResponse(res, false, null, err.message, 500);
        }
        sendResponse(res, true, updatedItem);
      });
    });
  });
});

// DELETE /api/data/:id - Delete item
router.delete('/data/:id', (req, res) => {
  const { id } = req.params;
  
  if (!validator.isInt(id)) {
    return sendResponse(res, false, null, 'Invalid ID format', 400);
  }
  
  // Check if item exists
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, existingItem) => {
    if (err) {
      console.error('Error checking item:', err);
      return sendResponse(res, false, null, err.message, 500);
    }
    
    if (!existingItem) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    db.run('DELETE FROM items WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting item:', err);
        return sendResponse(res, false, null, err.message, 500);
      }
      
      sendResponse(res, true, { id, message: 'Item deleted successfully' });
    });
  });
});

// POST /api/search - Search and filter items
router.post('/search', (req, res) => {
  const { query, category, minPrice, maxPrice } = req.body;
  
  let sql = 'SELECT * FROM items WHERE 1=1';
  const params = [];
  
  if (query && !validator.isEmpty(query.trim())) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${query}%`, `%${query}%`);
  }
  
  if (category && !validator.isEmpty(category.trim())) {
    sql += ' AND category = ?';
    params.push(category);
  }
  
  if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
    sql += ' AND price >= ?';
    params.push(minPrice);
  }
  
  if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
    sql += ' AND price <= ?';
    params.push(maxPrice);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  db.all(sql, params, (err, items) => {
    if (err) {
      console.error('Error searching items:', err);
      return sendResponse(res, false, null, err.message, 500);
    }
    sendResponse(res, true, items);
  });
});

module.exports = router;
