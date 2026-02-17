# Firebase Troubleshooting Guide

Common issues and solutions when working with the Firebase Learning Module.

## Table of Contents

1. [Authentication & Setup Issues](#authentication--setup-issues)
2. [Security Rules Errors](#security-rules-errors)
3. [Connection Problems](#connection-problems)
4. [Query Issues](#query-issues)
5. [WebSocket Problems](#websocket-problems)
6. [Performance Issues](#performance-issues)
7. [Quota and Billing](#quota-and-billing)
8. [Development Environment](#development-environment)

---

## Authentication & Setup Issues

### Error: "Error loading service account file"

**Cause:** Service account JSON file not found or invalid path.

**Solutions:**
1. Verify file exists in backend directory:
```bash
ls -la backend/firebase-adminsdk.json
```

2. Check path in `.env`:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-adminsdk.json
```

3. Ensure file has valid JSON format:
```bash
cat backend/firebase-adminsdk.json | python -m json.tool
```

---

### Error: "Could not load the default credentials"

**Cause:** Missing or invalid Firebase credentials.

**Solutions:**

**Option 1: Use service account file**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-adminsdk.json
```

**Option 2: Use environment variables**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
```

**Important:** Keep the `\n` characters in FIREBASE_PRIVATE_KEY

---

### Error: "Project ID is required to access Firestore"

**Cause:** Missing project ID in credentials.

**Solution:**
1. Check `.env` file has `FIREBASE_PROJECT_ID`
2. Or ensure service account JSON has `project_id` field
3. Restart server after changing `.env`

---

### Error: "Error: The caller does not have permission"

**Cause:** Service account lacks necessary permissions.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to IAM & Admin → IAM
4. Find your service account
5. Add roles:
   - Cloud Datastore User
   - Firebase Admin
6. Wait 5-10 minutes for propagation

---

## Security Rules Errors

### Error: "PERMISSION_DENIED: Missing or insufficient permissions"

**Cause:** Firestore security rules blocking the operation.

**Solutions:**

**For Development (Test Mode):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**For Production:**
1. Use Firebase Admin SDK (bypasses rules)
2. Or implement proper authentication
3. Update rules to allow operations:
```javascript
match /items/{itemId} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

---

### Error: "Rule compilation error"

**Cause:** Syntax error in security rules.

**Solution:**
1. Check for typos in rules
2. Ensure proper bracket matching
3. Use Rules Playground in Firebase Console
4. Common mistakes:
   - Missing semicolons
   - Incorrect field paths
   - Wrong operators (`=` vs `==`)

**Valid rule example:**
```javascript
allow read: if request.auth != null && resource.data.userId == request.auth.uid;
```

---

## Connection Problems

### Error: "ECONNREFUSED: Connection refused"

**Cause:** Backend server not running or wrong port.

**Solutions:**
1. Start backend server:
```bash
cd backend
npm run dev
```

2. Check if server is running:
```bash
curl http://localhost:3000/health
```

3. Verify PORT in `.env`:
```env
PORT=3000
```

4. Check if port is in use:
```bash
lsof -i :3000
```

---

### Error: "Network request failed"

**Cause:** CORS issue or network connectivity.

**Solutions:**

**Backend CORS configuration:**
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

**Frontend API URL:**
```env
VITE_API_URL=http://localhost:3000/api
```

**Check browser console for detailed error:**
- Open DevTools → Console
- Look for CORS error messages

---

### Error: "Failed to fetch"

**Cause:** Backend not accessible or wrong API URL.

**Solutions:**
1. Verify backend is running
2. Check API URL in frontend `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

3. Test API directly:
```bash
curl http://localhost:3000/api/data
```

4. Check browser network tab for request details

---

## Query Issues

### Error: "The query requires an index"

**Cause:** Composite index not created for the query.

**Solutions:**

**Quick Fix (Development):**
1. Firebase will provide an error with a link
2. Click the link to auto-create the index
3. Wait 5-10 minutes for index to build

**Manual Creation:**
1. Go to Firestore → Indexes
2. Click "Create Index"
3. Add fields:
   - `category` (Ascending)
   - `createdAt` (Descending)
4. Click "Create"

**Using Firebase CLI:**
Create `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "category", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    }
  ]
}
```

Deploy:
```bash
firebase deploy --only firestore:indexes
```

---

### Error: "Cannot use multiple inequality filters"

**Cause:** Firestore limitation - only one inequality filter per query.

**Example of invalid query:**
```javascript
// ❌ Invalid
.where('price', '>', 100)
.where('stock', '<', 50)
```

**Solutions:**

**Option 1: Use one inequality filter**
```javascript
// ✅ Valid
.where('price', '>', 100)
.where('category', '==', 'Electronics')
```

**Option 2: Client-side filtering**
```javascript
const items = await db.collection('items')
  .where('price', '>', 100)
  .get();

// Filter stock on client
const filtered = items.filter(item => item.stock < 50);
```

**Option 3: Restructure data**
- Use composite fields
- Denormalize data
- Use Cloud Functions

---

### Empty Results When Data Exists

**Cause:** Case sensitivity or whitespace in queries.

**Solutions:**
1. Check exact field values in Firestore Console
2. Ensure case matches:
```javascript
// Case sensitive
.where('category', '==', 'Electronics') // ✅
.where('category', '==', 'electronics') // ❌
```

3. Trim whitespace:
```javascript
.where('category', '==', category.trim())
```

4. Use text search for flexible matching (requires client-side)

---

## WebSocket Problems

### WebSocket Connection Failed

**Cause:** Backend not running or wrong WebSocket URL.

**Solutions:**
1. Verify backend is running with WebSocket support
2. Check WebSocket URL:
```env
VITE_WS_URL=ws://localhost:3000/ws
```

3. Test WebSocket connection:
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('Connected!');
ws.onerror = (err) => console.error('Error:', err);
```

4. Check browser console for errors

---

### WebSocket Disconnects Frequently

**Cause:** Network issues or server timeout.

**Solutions:**

**Implement reconnection:**
```javascript
let ws;
let reconnectInterval;

function connect() {
  ws = new WebSocket('ws://localhost:3000/ws');
  
  ws.onclose = () => {
    console.log('Disconnected, reconnecting...');
    reconnectInterval = setTimeout(connect, 5000);
  };
  
  ws.onopen = () => {
    clearTimeout(reconnectInterval);
    console.log('Connected!');
  };
}

connect();
```

**Add heartbeat:**
```javascript
// Client
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);

// Server
ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'ping') {
    ws.send(JSON.stringify({ type: 'pong' }));
  }
});
```

---

### Real-time Updates Not Working

**Cause:** Firestore listener not set up or WebSocket issue.

**Solutions:**
1. Check backend console for listener errors
2. Verify WebSocket connection is active
3. Test Firestore listener directly:
```javascript
db.collection('items')
  .onSnapshot((snapshot) => {
    console.log('Changes:', snapshot.docChanges().length);
  });
```

4. Check if updates trigger in Firestore Console

---

## Performance Issues

### Slow Query Execution

**Causes:**
- Missing indexes
- Large result sets
- Network latency

**Solutions:**

**1. Create indexes:**
```bash
# Check slow queries in Firebase Console
# Go to Firestore → Usage → Slow Queries
```

**2. Use pagination:**
```javascript
const snapshot = await db.collection('items')
  .orderBy('createdAt', 'desc')
  .limit(50) // Limit results
  .get();
```

**3. Use select() for specific fields:**
```javascript
const snapshot = await db.collection('items')
  .select('name', 'price') // Only fetch needed fields
  .get();
```

**4. Cache frequently accessed data:**
```javascript
let cachedItems = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getItems() {
  if (cachedItems && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedItems;
  }
  
  cachedItems = await fetchFromFirestore();
  cacheTime = Date.now();
  return cachedItems;
}
```

---

### High Read Costs

**Cause:** Excessive document reads.

**Solutions:**
1. Implement client-side caching
2. Use real-time listeners instead of polling
3. Reduce query frequency
4. Use `limit()` to reduce result size
5. Monitor usage in Firebase Console

---

## Quota and Billing

### Error: "Quota exceeded"

**Cause:** Exceeded free tier limits.

**Free Tier Limits:**
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GiB storage

**Solutions:**
1. Upgrade to Blaze (pay-as-you-go) plan
2. Reduce read/write operations
3. Implement caching
4. Use batched operations
5. Monitor usage:
   - Firebase Console → Usage
   - Set up budget alerts

---

### Unexpected Charges

**Cause:** High usage or inefficient queries.

**Solutions:**
1. Review usage in Firebase Console
2. Check for:
   - Infinite loops triggering writes
   - Missing limits on queries
   - Real-time listeners on large collections
   - Excessive polling
3. Set budget alerts
4. Implement rate limiting

---

## Development Environment

### Error: "Module not found"

**Cause:** Missing npm dependencies.

**Solution:**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

### Error: "Port already in use"

**Cause:** Another process using the port.

**Solutions:**

**Find and kill process:**
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Use different port:**
```env
# Backend .env
PORT=3001
```

---

### Hot Reload Not Working

**Cause:** Nodemon or Vite configuration issue.

**Solutions:**

**Backend (nodemon):**
```bash
npm run dev # Should use nodemon
```

**Frontend (Vite):**
```bash
npm run dev # Should enable HMR
```

**Check logs for errors**

---

## Getting Help

### Debug Checklist

1. ✅ Check browser console for errors
2. ✅ Check server console for errors  
3. ✅ Verify all environment variables are set
4. ✅ Test API endpoints with curl
5. ✅ Check Firestore security rules
6. ✅ Verify indexes are created
7. ✅ Check Firebase Console for errors
8. ✅ Review network tab in DevTools

### Useful Commands

**Test API:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/data
```

**Check logs:**
```bash
# Backend logs
npm run dev

# Frontend logs  
npm run dev
```

**Firebase CLI:**
```bash
firebase login
firebase projects:list
firebase firestore:indexes
```

### Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Support](https://firebase.google.com/support)
- [GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues)
- [Firebase Community Slack](https://firebase.community/)

### Contact

For issues specific to this learning module, check the main README.md or repository issues.
