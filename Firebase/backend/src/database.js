require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let serviceAccount;

// Try to load from service account file first, then from environment variables
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  try {
    serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
  } catch (error) {
    console.error('Error loading service account file:', error.message);
  }
}

// Initialize Firebase Admin
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
} else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
} else {
  console.error('⚠️  Firebase credentials not found. Please set environment variables or provide service account file.');
  console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
}

// Get Firestore instance
const db = admin.firestore();

// Configure Firestore settings
db.settings({
  timestampsInSnapshots: true
});

console.log('✓ Connected to Firebase Firestore');

// Collection reference
const itemsCollection = db.collection('items');

// Database operations
const database = {
  // Get Firestore instance
  getDb: () => db,
  
  // Get items collection
  getCollection: () => itemsCollection,
  
  // Get all items
  getAllItems: async () => {
    try {
      const snapshot = await itemsCollection.orderBy('createdAt', 'desc').get();
      const items = [];
      snapshot.forEach(doc => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return items;
    } catch (error) {
      throw new Error(`Error fetching items: ${error.message}`);
    }
  },
  
  // Get single item by ID
  getItemById: async (id) => {
    try {
      const doc = await itemsCollection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Error fetching item: ${error.message}`);
    }
  },
  
  // Create new item
  createItem: async (data) => {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const itemData = {
        name: data.name,
        description: data.description || '',
        price: data.price || 0,
        category: data.category || '',
        stock: data.stock || 0,
        featured: data.featured || false,
        userId: data.userId || 'anonymous',
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      const docRef = await itemsCollection.add(itemData);
      const doc = await docRef.get();
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Error creating item: ${error.message}`);
    }
  },
  
  // Update existing item
  updateItem: async (id, data) => {
    try {
      const docRef = itemsCollection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      const updateData = {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.userId && { userId: data.userId }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      throw new Error(`Error updating item: ${error.message}`);
    }
  },
  
  // Delete item
  deleteItem: async (id) => {
    try {
      const docRef = itemsCollection.doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      await docRef.delete();
      return { id };
    } catch (error) {
      throw new Error(`Error deleting item: ${error.message}`);
    }
  },
  
  // Query items by category
  getItemsByCategory: async (category) => {
    try {
      const snapshot = await itemsCollection
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .get();
      
      const items = [];
      snapshot.forEach(doc => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return items;
    } catch (error) {
      throw new Error(`Error querying items by category: ${error.message}`);
    }
  },
  
  // Search items
  searchItems: async (filters) => {
    try {
      let query = itemsCollection;
      
      // Apply category filter
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      
      // Apply featured filter
      if (filters.featured !== undefined) {
        query = query.where('featured', '==', filters.featured);
      }
      
      // Order by createdAt
      query = query.orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      let items = [];
      
      snapshot.forEach(doc => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Client-side filtering for text search and price range
      if (filters.query) {
        const searchQuery = filters.query.toLowerCase();
        items = items.filter(item => 
          (item.name && item.name.toLowerCase().includes(searchQuery)) ||
          (item.description && item.description.toLowerCase().includes(searchQuery))
        );
      }
      
      if (filters.minPrice !== undefined) {
        items = items.filter(item => item.price >= filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        items = items.filter(item => item.price <= filters.maxPrice);
      }
      
      return items;
    } catch (error) {
      throw new Error(`Error searching items: ${error.message}`);
    }
  },
  
  // Set up real-time listener
  setupRealtimeListener: (callback) => {
    const unsubscribe = itemsCollection
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const item = {
              id: change.doc.id,
              ...change.doc.data()
            };
            
            callback({
              type: change.type, // 'added', 'modified', 'removed'
              item: item
            });
          });
        },
        (error) => {
          console.error('Real-time listener error:', error);
        }
      );
    
    return unsubscribe;
  }
};

module.exports = database;
