const express = require('express');
const router = express.Router();
const { executeQuery, toNativeTypes } = require('./database');
const validator = require('validator');

// Simple UUID generator (alternative to uuid package)
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

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
  
  if (data.price !== undefined && data.price !== null) {
    const priceStr = String(data.price);
    if (!validator.isFloat(priceStr, { min: 0 })) {
      errors.push('Price must be a positive number');
    }
  }
  
  if (data.stock !== undefined && data.stock !== null) {
    const stockStr = String(data.stock);
    if (!validator.isInt(stockStr, { min: 0 })) {
      errors.push('Stock must be a positive integer');
    }
  }
  
  return errors;
};

// Convert Neo4j node to plain object
const nodeToObject = (node) => {
  if (!node) return null;
  return toNativeTypes(node.properties);
};

// GET /api/items - Get all items with their relationships
router.get('/items', async (req, res) => {
  try {
    const result = await executeQuery(`
      MATCH (i:Item)
      OPTIONAL MATCH (i)-[:BELONGS_TO]->(c:Category)
      OPTIONAL MATCH (i)-[:HAS_TAG]->(t:Tag)
      RETURN i, 
             c.id as categoryId, 
             c.name as categoryName,
             collect(DISTINCT {id: t.id, name: t.name}) as tags
      ORDER BY i.createdAt DESC
    `);
    
    const items = result.records.map(record => {
      const item = nodeToObject(record.get('i'));
      const categoryId = record.get('categoryId');
      const categoryName = record.get('categoryName');
      const tags = record.get('tags').filter(t => t.id !== null);
      
      return {
        ...item,
        category: categoryId ? { id: categoryId, name: categoryName } : null,
        tags: tags
      };
    });
    
    sendResponse(res, true, items);
  } catch (error) {
    console.error('Error fetching items:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/items/:id - Get single item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(`
      MATCH (i:Item {id: $id})
      OPTIONAL MATCH (i)-[:BELONGS_TO]->(c:Category)
      OPTIONAL MATCH (i)-[:HAS_TAG]->(t:Tag)
      RETURN i,
             c.id as categoryId,
             c.name as categoryName,
             collect(DISTINCT {id: t.id, name: t.name}) as tags
    `, { id });
    
    if (result.records.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    const record = result.records[0];
    const item = nodeToObject(record.get('i'));
    const categoryId = record.get('categoryId');
    const categoryName = record.get('categoryName');
    const tags = record.get('tags').filter(t => t.id !== null);
    
    const itemWithRelations = {
      ...item,
      category: categoryId ? { id: categoryId, name: categoryName } : null,
      tags: tags
    };
    
    sendResponse(res, true, itemWithRelations);
  } catch (error) {
    console.error('Error fetching item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// POST /api/items - Create new item
router.post('/items', async (req, res) => {
  try {
    const { name, description, category, price, stock, tags } = req.body;
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Create item node
    let cypher = `
      CREATE (i:Item {
        id: $id,
        name: $name,
        description: $description,
        price: $price,
        stock: $stock,
        createdAt: $createdAt,
        updatedAt: $updatedAt
      })
    `;
    
    const params = {
      id,
      name: name.trim(),
      description: description || '',
      price: price || 0,
      stock: stock || 0,
      createdAt: now,
      updatedAt: now
    };
    
    // Add category relationship if provided
    if (category) {
      cypher += `
        MERGE (c:Category {id: $categoryId, name: $categoryName})
        CREATE (i)-[:BELONGS_TO]->(c)
      `;
      params.categoryId = category.id || uuidv4();
      params.categoryName = category.name || category;
    }
    
    cypher += ' RETURN i';
    
    const result = await executeQuery(cypher, params);
    const newItem = nodeToObject(result.records[0].get('i'));
    
    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) {
        const tagId = tag.id || uuidv4();
        const tagName = tag.name || tag;
        await executeQuery(`
          MATCH (i:Item {id: $itemId})
          MERGE (t:Tag {id: $tagId, name: $tagName})
          CREATE (i)-[:HAS_TAG]->(t)
        `, { itemId: id, tagId, tagName });
      }
    }
    
    // Fetch the created item with relationships
    const fetchResult = await executeQuery(`
      MATCH (i:Item {id: $id})
      OPTIONAL MATCH (i)-[:BELONGS_TO]->(c:Category)
      OPTIONAL MATCH (i)-[:HAS_TAG]->(t:Tag)
      RETURN i,
             c.id as categoryId,
             c.name as categoryName,
             collect(DISTINCT {id: t.id, name: t.name}) as tags
    `, { id });
    
    const record = fetchResult.records[0];
    const item = nodeToObject(record.get('i'));
    const categoryId = record.get('categoryId');
    const categoryName = record.get('categoryName');
    const itemTags = record.get('tags').filter(t => t.id !== null);
    
    const itemWithRelations = {
      ...item,
      category: categoryId ? { id: categoryId, name: categoryName } : null,
      tags: itemTags
    };
    
    sendResponse(res, true, itemWithRelations, null, 201);
  } catch (error) {
    console.error('Error creating item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// PUT /api/items/:id - Update existing item
router.put('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock } = req.body;
    
    // Check if item exists
    const checkResult = await executeQuery('MATCH (i:Item {id: $id}) RETURN i', { id });
    if (checkResult.records.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Validation
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      return sendResponse(res, false, null, errors.join(', '), 400);
    }
    
    const now = new Date().toISOString();
    
    // Update item properties
    await executeQuery(`
      MATCH (i:Item {id: $id})
      SET i.name = $name,
          i.description = $description,
          i.price = $price,
          i.stock = $stock,
          i.updatedAt = $updatedAt
    `, {
      id,
      name: name.trim(),
      description: description || '',
      price: price || 0,
      stock: stock || 0,
      updatedAt: now
    });
    
    // Update category if provided
    if (category) {
      await executeQuery(`
        MATCH (i:Item {id: $id})
        OPTIONAL MATCH (i)-[r:BELONGS_TO]->()
        DELETE r
        WITH i
        MERGE (c:Category {id: $categoryId, name: $categoryName})
        CREATE (i)-[:BELONGS_TO]->(c)
      `, {
        id,
        categoryId: category.id || uuidv4(),
        categoryName: category.name || category
      });
    }
    
    // Fetch updated item with relationships
    const result = await executeQuery(`
      MATCH (i:Item {id: $id})
      OPTIONAL MATCH (i)-[:BELONGS_TO]->(c:Category)
      OPTIONAL MATCH (i)-[:HAS_TAG]->(t:Tag)
      RETURN i,
             c.id as categoryId,
             c.name as categoryName,
             collect(DISTINCT {id: t.id, name: t.name}) as tags
    `, { id });
    
    const record = result.records[0];
    const item = nodeToObject(record.get('i'));
    const categoryId = record.get('categoryId');
    const categoryName = record.get('categoryName');
    const tags = record.get('tags').filter(t => t.id !== null);
    
    const itemWithRelations = {
      ...item,
      category: categoryId ? { id: categoryId, name: categoryName } : null,
      tags: tags
    };
    
    sendResponse(res, true, itemWithRelations);
  } catch (error) {
    console.error('Error updating item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists
    const checkResult = await executeQuery('MATCH (i:Item {id: $id}) RETURN i', { id });
    if (checkResult.records.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    // Delete item and all its relationships
    await executeQuery(`
      MATCH (i:Item {id: $id})
      DETACH DELETE i
    `, { id });
    
    sendResponse(res, true, { id, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await executeQuery(`
      MATCH (c:Category)
      OPTIONAL MATCH (c)<-[:BELONGS_TO]-(i:Item)
      RETURN c, count(i) as itemCount
      ORDER BY c.name
    `);
    
    const categories = result.records.map(record => ({
      ...nodeToObject(record.get('c')),
      itemCount: toNativeTypes(record.get('itemCount'))
    }));
    
    sendResponse(res, true, categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/tags - Get all tags
router.get('/tags', async (req, res) => {
  try {
    const result = await executeQuery(`
      MATCH (t:Tag)
      OPTIONAL MATCH (t)<-[:HAS_TAG]-(i:Item)
      RETURN t, count(i) as itemCount
      ORDER BY t.name
    `);
    
    const tags = result.records.map(record => ({
      ...nodeToObject(record.get('t')),
      itemCount: toNativeTypes(record.get('itemCount'))
    }));
    
    sendResponse(res, true, tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// POST /api/items/:id/tags - Add tag to item
router.post('/items/:id/tags', async (req, res) => {
  try {
    const { id } = req.params;
    const { tagId, tagName } = req.body;
    
    if (!tagName) {
      return sendResponse(res, false, null, 'Tag name is required', 400);
    }
    
    // Check if item exists
    const checkResult = await executeQuery('MATCH (i:Item {id: $id}) RETURN i', { id });
    if (checkResult.records.length === 0) {
      return sendResponse(res, false, null, 'Item not found', 404);
    }
    
    const finalTagId = tagId || uuidv4();
    
    await executeQuery(`
      MATCH (i:Item {id: $itemId})
      MERGE (t:Tag {id: $tagId, name: $tagName})
      MERGE (i)-[:HAS_TAG]->(t)
    `, { itemId: id, tagId: finalTagId, tagName: tagName.trim() });
    
    sendResponse(res, true, { id: finalTagId, name: tagName.trim() }, 'Tag added successfully');
  } catch (error) {
    console.error('Error adding tag:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// DELETE /api/items/:id/tags/:tagId - Remove tag from item
router.delete('/items/:id/tags/:tagId', async (req, res) => {
  try {
    const { id, tagId } = req.params;
    
    await executeQuery(`
      MATCH (i:Item {id: $itemId})-[r:HAS_TAG]->(t:Tag {id: $tagId})
      DELETE r
    `, { itemId: id, tagId });
    
    sendResponse(res, true, { message: 'Tag removed successfully' });
  } catch (error) {
    console.error('Error removing tag:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/items/:id/related - Find related items via tags and category
router.get('/items/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find items with shared tags or same category
    const result = await executeQuery(`
      MATCH (i:Item {id: $id})
      OPTIONAL MATCH (i)-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(related:Item)
      WHERE related.id <> $id
      WITH i, related, count(t) as sharedTags
      OPTIONAL MATCH (i)-[:BELONGS_TO]->(c:Category)<-[:BELONGS_TO]-(related2:Item)
      WHERE related2.id <> $id
      WITH collect(DISTINCT {item: related, score: sharedTags, reason: 'shared tags'}) +
           collect(DISTINCT {item: related2, score: 1, reason: 'same category'}) as allRelated
      UNWIND allRelated as rel
      WITH rel.item as item, sum(rel.score) as totalScore, collect(rel.reason) as reasons
      WHERE item IS NOT NULL
      RETURN DISTINCT item, totalScore, reasons
      ORDER BY totalScore DESC
      LIMIT 10
    `, { id });
    
    const relatedItems = result.records.map(record => ({
      ...nodeToObject(record.get('item')),
      relationScore: toNativeTypes(record.get('totalScore')),
      relationReasons: record.get('reasons')
    }));
    
    sendResponse(res, true, relatedItems);
  } catch (error) {
    console.error('Error finding related items:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// GET /api/graph/path/:fromId/:toId - Find shortest path between items
router.get('/graph/path/:fromId/:toId', async (req, res) => {
  try {
    const { fromId, toId } = req.params;
    
    const result = await executeQuery(`
      MATCH (from:Item {id: $fromId}), (to:Item {id: $toId})
      MATCH path = shortestPath((from)-[*]-(to))
      RETURN path, length(path) as pathLength
    `, { fromId, toId });
    
    if (result.records.length === 0) {
      return sendResponse(res, true, { 
        found: false, 
        message: 'No path found between these items' 
      });
    }
    
    const record = result.records[0];
    const path = record.get('path');
    const pathLength = toNativeTypes(record.get('pathLength'));
    
    // Extract nodes and relationships from path
    const nodes = path.segments.flatMap((segment, idx) => {
      const nodes = [nodeToObject(segment.start)];
      if (idx === path.segments.length - 1) {
        nodes.push(nodeToObject(segment.end));
      }
      return nodes;
    });
    
    const relationships = path.segments.map(segment => ({
      type: segment.relationship.type,
      from: segment.start.properties.id,
      to: segment.end.properties.id
    }));
    
    sendResponse(res, true, {
      found: true,
      pathLength,
      nodes,
      relationships
    });
  } catch (error) {
    console.error('Error finding path:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

// POST /api/search - Search and filter items
router.post('/search', async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, tags } = req.body;
    
    let cypher = 'MATCH (i:Item)';
    const params = {};
    const conditions = [];
    
    if (category) {
      cypher += ' MATCH (i)-[:BELONGS_TO]->(c:Category {name: $category})';
      params.category = category;
    }
    
    if (tags && Array.isArray(tags) && tags.length > 0) {
      cypher += ' MATCH (i)-[:HAS_TAG]->(t:Tag) WHERE t.name IN $tags';
      params.tags = tags;
    }
    
    if (query && !validator.isEmpty(query.trim())) {
      conditions.push('(i.name CONTAINS $query OR i.description CONTAINS $query)');
      params.query = query;
    }
    
    if (minPrice !== undefined && validator.isFloat(String(minPrice))) {
      conditions.push('i.price >= $minPrice');
      params.minPrice = parseFloat(minPrice);
    }
    
    if (maxPrice !== undefined && validator.isFloat(String(maxPrice))) {
      conditions.push('i.price <= $maxPrice');
      params.maxPrice = parseFloat(maxPrice);
    }
    
    if (conditions.length > 0) {
      cypher += ' WHERE ' + conditions.join(' AND ');
    }
    
    cypher += ` 
      OPTIONAL MATCH (i)-[:BELONGS_TO]->(cat:Category)
      OPTIONAL MATCH (i)-[:HAS_TAG]->(tag:Tag)
      RETURN DISTINCT i,
             cat.id as categoryId,
             cat.name as categoryName,
             collect(DISTINCT {id: tag.id, name: tag.name}) as tags
      ORDER BY i.createdAt DESC
    `;
    
    const result = await executeQuery(cypher, params);
    
    const items = result.records.map(record => {
      const item = nodeToObject(record.get('i'));
      const categoryId = record.get('categoryId');
      const categoryName = record.get('categoryName');
      const itemTags = record.get('tags').filter(t => t.id !== null);
      
      return {
        ...item,
        category: categoryId ? { id: categoryId, name: categoryName } : null,
        tags: itemTags
      };
    });
    
    sendResponse(res, true, items);
  } catch (error) {
    console.error('Error searching items:', error);
    sendResponse(res, false, null, error.message, 500);
  }
});

module.exports = router;
