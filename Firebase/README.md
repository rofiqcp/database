# Firebase Learning Module

A comprehensive full-stack learning module demonstrating Firebase Firestore with real-time synchronization, built with Node.js, Express, Vue 3, and WebSockets.

## 🔥 Features

### Backend
- **Firebase Admin SDK** for server-side operations
- **Cloud Firestore** NoSQL database
- **RESTful API** with Express.js
- **WebSocket** real-time updates
- **API Key Authentication**
- **Input Validation**
- **Comprehensive Error Handling**
- **CRUD Operations**
- **Advanced Queries** (category filtering, search, pagination)

### Frontend
- **Vue 3** with Composition API
- **Pinia** state management
- **TailwindCSS** styling
- **Real-time Data Sync** via WebSocket
- **Dark Mode** toggle
- **Responsive Design**
- **Live Connection Indicator**
- **Category Filtering**
- **Search & Filter**

### Real-time Features
- **Live Data Sync** - Changes instantly reflected across all clients
- **WebSocket Integration** - Persistent connection for real-time updates
- **Change Notifications** - Added, modified, removed events
- **Connection Status** - Visual indicator for connection state
- **Automatic Reconnection** - Handles disconnections gracefully

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase account
- Firebase project with Firestore enabled
- Firebase service account credentials

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
cd Firebase
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your Firebase credentials:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
API_KEY=your-secret-api-key
```

Start backend:
```bash
npm run dev
```

Backend runs on http://localhost:3000

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
VITE_API_KEY=your-secret-api-key
```

Start frontend:
```bash
npm run dev
```

Frontend runs on http://localhost:5173

### 4. Firebase Configuration

See [docs/SETUP.md](docs/SETUP.md) for detailed Firebase setup instructions.

## 📁 Project Structure

```
Firebase/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server + WebSocket
│   │   ├── database.js        # Firestore operations
│   │   └── routes.js          # API routes
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── api.js
│   │   ├── style.css
│   │   ├── components/
│   │   │   ├── DataTable.vue
│   │   │   ├── CreateForm.vue
│   │   │   ├── EditForm.vue
│   │   │   ├── DetailView.vue
│   │   │   └── SearchFilter.vue
│   │   └── stores/
│   │       └── dataStore.js   # Pinia store with WebSocket
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── docs/
│   ├── SETUP.md               # Firebase setup guide
│   ├── API_DOCS.md            # API documentation
│   ├── DATABASE_INFO.md       # Firestore structure
│   ├── FEATURES.md            # Firebase features
│   └── TROUBLESHOOTING.md     # Common issues
├── examples/
│   ├── sample_data.json       # 50 sample items
│   └── query_examples.txt     # 55 query examples
└── README.md
```

## 🎯 Core Concepts

### Firestore Database Schema

```javascript
{
  id: string,              // Auto-generated document ID
  name: string,            // Item name (required)
  description: string,     // Item description
  price: number,           // Price in dollars
  category: string,        // Category (Electronics, Books, etc.)
  stock: number,           // Available quantity
  featured: boolean,       // Featured flag
  userId: string,          // User identifier
  createdAt: Timestamp,    // Creation timestamp
  updatedAt: Timestamp     // Update timestamp
}
```

### API Endpoints

- `GET /api/data` - Get all items
- `GET /api/data/:id` - Get item by ID
- `POST /api/data` - Create item (requires API key)
- `PUT /api/data/:id` - Update item (requires API key)
- `DELETE /api/data/:id` - Delete item (requires API key)
- `GET /api/category/:category` - Get items by category
- `POST /api/search` - Search with filters

### WebSocket Real-time Updates

Connect to `ws://localhost:3000/ws` for real-time data synchronization.

**Message Format:**
```json
{
  "type": "data_change",
  "changeType": "added|modified|removed",
  "data": { /* item data */ },
  "timestamp": "ISO 8601 timestamp"
}
```

## 📚 Documentation

- **[SETUP.md](docs/SETUP.md)** - Complete Firebase and Firestore setup guide
- **[API_DOCS.md](docs/API_DOCS.md)** - API endpoints and WebSocket documentation
- **[DATABASE_INFO.md](docs/DATABASE_INFO.md)** - Firestore structure, indexes, and security rules
- **[FEATURES.md](docs/FEATURES.md)** - Firebase features and implementation details
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🔧 Usage Examples

### Create Item (cURL)

```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "name": "Laptop",
    "description": "Gaming laptop",
    "price": 1299.99,
    "category": "Electronics",
    "stock": 10,
    "featured": true
  }'
```

### Query by Category (JavaScript)

```javascript
const response = await fetch('http://localhost:3000/api/category/Electronics');
const result = await response.json();
console.log(result.data);
```

### Real-time Updates (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'data_change') {
    console.log('Change type:', message.changeType);
    console.log('Item:', message.data);
  }
};
```

## 🧪 Testing

**Test Backend:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/data
```

**Test WebSocket:**
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', e.data);
```

## 🌟 Key Learning Points

1. **Firebase Admin SDK** - Server-side Firebase operations
2. **Firestore NoSQL** - Document-based database
3. **Real-time Sync** - WebSocket + Firestore listeners
4. **Security Rules** - Database-level access control
5. **Composite Indexes** - Optimize complex queries
6. **Server Timestamps** - Consistent time tracking
7. **API Authentication** - Protect write operations
8. **Error Handling** - Firebase-specific error codes

## 🔒 Security

- API key required for write operations
- Firestore security rules for data access
- Service account credentials (keep secure!)
- CORS configuration
- Input validation

**Important:** Never commit `.env` files or `firebase-adminsdk.json` to version control.

## 📦 Sample Data

Load 50 sample items from `examples/sample_data.json`:

```bash
# Using Node.js script
node scripts/load-sample-data.js

# Or manually via API
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d @examples/sample_data.json
```

## 🐛 Troubleshooting

Common issues and solutions:

**Connection Refused:**
- Ensure backend server is running
- Check PORT in `.env`

**Permission Denied:**
- Verify Firestore security rules
- Check API key is correct
- Ensure service account has proper permissions

**WebSocket Connection Failed:**
- Backend server must be running
- Check VITE_WS_URL is correct
- Verify firewall settings

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more details.

## 🚀 Production Deployment

1. Set up environment variables on your hosting platform
2. Configure Firestore security rules for production
3. Enable Firebase Authentication for user management
4. Set up composite indexes
5. Monitor usage in Firebase Console
6. Enable automated backups

## 📊 Firebase Limits

**Free Tier (Spark Plan):**
- 50,000 reads/day
- 20,000 writes/day
- 1 GiB storage
- 10 GiB/month network egress

**Paid Tier (Blaze Plan):**
- Pay as you go pricing
- No daily limits
- Better for production apps

## 🤝 Contributing

This is a learning module. Feel free to:
- Add new features
- Improve documentation
- Fix bugs
- Add more examples

## 📖 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Vue 3 Documentation](https://vuejs.org/)
- [Express.js Guide](https://expressjs.com/)

## 📄 License

MIT License - feel free to use for learning and teaching.

## 🎓 What You'll Learn

- Setting up Firebase project and Firestore
- Using Firebase Admin SDK for server-side operations
- Implementing real-time data synchronization
- Building RESTful APIs with Express.js
- WebSocket integration for live updates
- Vue 3 with Pinia state management
- TailwindCSS for responsive design
- Error handling and validation
- Security best practices
- Database design and indexing

---

**Happy Learning! 🔥**

For questions or issues, check the [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) guide.
