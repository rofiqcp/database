# CouchDB Learning Module

Complete full-stack CRUD application built with Node.js, Express, Vue 3, and CouchDB database.

![](https://img.shields.io/badge/Database-CouchDB-red)
![](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20Vite-brightgreen)
![](https://img.shields.io/badge/Style-TailwindCSS-blue)

## 📋 Overview

This is a comprehensive learning module demonstrating full-stack development with CouchDB database. It includes a complete backend API, modern frontend UI, and extensive documentation.

## ✨ Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **RESTful API** - Well-structured Express.js backend
- ✅ **Modern Frontend** - Vue 3 with Composition API
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Search & Filter** - Advanced filtering capabilities
- ✅ **Responsive Design** - Works on all devices
- ✅ **Input Validation** - Client and server-side validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **CouchDB Database** - NoSQL document database with HTTP API
- ✅ **MapReduce Views** - Efficient indexing and querying
- ✅ **Mango Queries** - MongoDB-style query syntax

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- CouchDB 3.x installed and running
- Text editor (VS Code recommended)

### CouchDB Setup

```bash
# Verify CouchDB is running
curl http://localhost:5984

# Access Fauxton (CouchDB Web UI)
# Open: http://localhost:5984/_utils
```

### Installation

```bash
# 1. Navigate to CouchDB folder
cd CouchDB

# 2. Setup Backend
cd backend
npm install
cp .env.example .env

# 3. Setup Frontend
cd ../frontend
npm install
cp .env.example .env
```

### Run Development Servers

```bash
# Terminal 1 - Backend (port 3000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **Fauxton (CouchDB UI)**: http://localhost:5984/_utils

## 📁 Project Structure

```
CouchDB/
├── backend/              # Node.js + Express Backend
│   ├── src/
│   │   ├── server.js    # Express app and server
│   │   ├── database.js  # CouchDB connection
│   │   └── routes.js    # API routes
│   ├── package.json
│   └── .env.example
├── frontend/            # Vue 3 + Vite Frontend
│   ├── src/
│   │   ├── components/  # Vue components
│   │   ├── stores/      # Pinia stores
│   │   ├── App.vue      # Main app
│   │   ├── main.js      # Entry point
│   │   └── api.js       # Axios config
│   ├── package.json
│   └── .env.example
├── docs/                # Documentation
│   ├── SETUP.md
│   ├── API_DOCS.md
│   ├── DATABASE_INFO.md
│   ├── FEATURES.md
│   └── TROUBLESHOOTING.md
├── examples/            # Example data and queries
│   ├── sample_data.json
│   └── query_examples.txt
└── README.md           # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: CouchDB with nano driver
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tools**: Nodemon

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite 5
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Styling**: TailwindCSS 3
- **CSS Processing**: PostCSS, Autoprefixer

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[SETUP.md](docs/SETUP.md)** - Complete setup instructions
- **[API_DOCS.md](docs/API_DOCS.md)** - API endpoint documentation
- **[DATABASE_INFO.md](docs/DATABASE_INFO.md)** - CouchDB information
- **[FEATURES.md](docs/FEATURES.md)** - Feature list
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | Get all items |
| GET | `/api/data/:id` | Get single item |
| POST | `/api/data` | Create new item |
| PUT | `/api/data/:id` | Update item |
| DELETE | `/api/data/:id` | Delete item |
| POST | `/api/search` | Search/filter items |
| GET | `/health` | Health check |

Full API documentation: [API_DOCS.md](docs/API_DOCS.md)

## 🎨 Frontend Components

- **DataTable** - Display all items in table format
- **CreateForm** - Form to create new items
- **EditForm** - Form to edit existing items
- **DetailView** - Display detailed item information
- **SearchFilter** - Advanced search and filtering UI

## 💾 Document Structure

CouchDB stores data as JSON documents:

```json
{
  "_id": "auto-generated-uuid",
  "_rev": "1-abc123def456",
  "type": "item",
  "name": "Laptop",
  "description": "Gaming laptop",
  "category": "Electronics",
  "price": 1299.99,
  "quantity": 5,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

Design documents define MapReduce views for indexing:

```javascript
{
  "_id": "_design/items",
  "views": {
    "by_category": {
      "map": "function(doc) { if (doc.type === 'item') { emit(doc.category, doc); } }"
    },
    "by_name": {
      "map": "function(doc) { if (doc.type === 'item') { emit(doc.name, doc); } }"
    }
  }
}
```

## 🔍 CouchDB Advanced Features

This module demonstrates CouchDB-specific features:

- **Document-Oriented Storage** - Schema-free JSON documents
- **MVCC** - Multi-Version Concurrency Control with revisions
- **MapReduce Views** - JavaScript views for indexing and querying
- **Mango Queries** - MongoDB-style query syntax
- **HTTP API** - Built-in RESTful API for all operations
- **Fauxton** - Built-in web administration interface
- **Auto-generated UUIDs** - Unique document identifiers

### Additional CouchDB Capabilities

CouchDB offers many advanced features not covered in this basic module:

- **Master-Master Replication** - Bi-directional sync between databases
- **Offline-First Design** - Works with PouchDB for offline apps
- **Changes Feed** - Real-time notifications of data changes
- **Attachments** - Store binary files as document attachments
- **Conflict Resolution** - Automatic conflict detection and resolution
- **Filtered Replication** - Selective data synchronization
- **Validate Doc Update** - Server-side document validation functions
- **Show/List Functions** - Custom rendering of documents

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:3000/health

# Get all items
curl http://localhost:3000/api/data

# Create item
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","price":99.99}'
```

### Test Frontend
1. Open http://localhost:5173
2. Navigate through tabs (List, Create, Edit, Detail, Search)
3. Try creating, editing, and deleting items
4. Test search and filter functionality
5. Toggle dark mode

## 🏗️ Building for Production

### Backend
```bash
cd backend
npm start  # Run in production mode
```

### Frontend
```bash
cd frontend
npm run build    # Build to dist/
npm run preview  # Preview production build
```

## 🔧 Configuration

### Backend (.env)
```env
PORT=3000
NODE_ENV=development

# CouchDB Configuration
COUCHDB_URL=http://admin:password@localhost:5984
COUCHDB_DATABASE=learning_db

CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📚 Learning Resources

This module is perfect for learning:
- Full-stack JavaScript development
- RESTful API design
- Vue 3 Composition API
- Pinia state management
- CouchDB NoSQL database operations
- Express.js backend development
- TailwindCSS styling
- Responsive design principles

## ⚠️ Security Note

This is a **learning module** designed for educational purposes. For production deployment, consider adding:

- **Rate Limiting**: Prevent API abuse (see API_DOCS.md for examples)
- **Authentication**: Add user authentication and authorization
- **HTTPS**: Use SSL/TLS in production
- **Input Sanitization**: Already included, but review for your use case
- **Environment Security**: Secure your .env files and credentials
- **CORS**: Configure CORS_ORIGIN for production domains
- **CouchDB Security**: Set up proper admin credentials and database-level security

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) and [API_DOCS.md](docs/API_DOCS.md) for more security recommendations.

## 🤝 Use Cases

- **Learning**: Educational tool for full-stack development
- **NoSQL Exploration**: Learn document database concepts
- **Prototyping**: Quick application prototyping
- **Offline-First Apps**: Foundation for offline-capable applications
- **Portfolio**: Showcase full-stack skills
- **Teaching**: Teach web development and NoSQL concepts
- **Replication Demos**: Demonstrate CouchDB replication features

## ⚠️ CouchDB vs SQL Databases

**CouchDB Advantages:**
- ✅ Schema-free JSON documents (flexible data structure)
- ✅ Built-in HTTP API (no separate driver needed)
- ✅ Master-master replication for distributed systems
- ✅ Offline-first design with PouchDB compatibility
- ✅ Fauxton web UI for administration
- ✅ MVCC for conflict-free concurrent access

**When to Use CouchDB:**
- Offline-first applications
- Applications needing master-master replication
- Document-centric data models
- RESTful API-first architectures
- Mobile apps with sync requirements

**SQL Alternatives:**
- Complex relational data models
- Applications requiring joins
- Strong schema enforcement needed
- Complex analytical queries

## 🐛 Troubleshooting

Common issues and solutions are documented in [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

Quick fixes:
```bash
# Port already in use
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process

# Dependencies issues
rm -rf node_modules package-lock.json
npm install

# CouchDB connection issues
curl http://localhost:5984  # Check CouchDB is running
```

## 📝 Example Usage

### Create an Item
```javascript
const response = await axios.post('/api/data', {
  name: 'Laptop',
  description: 'Gaming laptop',
  category: 'Electronics',
  price: 1299.99,
  quantity: 5
})
```

### Search Items
```javascript
const results = await axios.post('/api/search', {
  query: 'laptop',
  category: 'Electronics',
  minPrice: 1000,
  maxPrice: 2000
})
```

## 🌟 Best Practices Demonstrated

- ✅ Separation of concerns
- ✅ Modular code organization
- ✅ Environment-based configuration
- ✅ Input validation and sanitization
- ✅ Error handling
- ✅ RESTful API design
- ✅ Responsive UI design
- ✅ State management patterns
- ✅ Document database design patterns
- ✅ MapReduce view optimization

## 🚧 Future Enhancements

Potential additions:
- [ ] Pagination
- [ ] Authentication
- [ ] File uploads via CouchDB attachments
- [ ] Data visualization
- [ ] Export to CSV/PDF
- [ ] Bulk operations
- [ ] Real-time updates via CouchDB changes feed
- [ ] User preferences
- [ ] PouchDB frontend integration for offline-first
- [ ] Filtered replication
- [ ] Document validation functions

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

Built with:
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Apache CouchDB](https://couchdb.apache.org/)
- [nano](https://github.com/apache/couchdb-nano)
- [TailwindCSS](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/)

## 📞 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Review [SETUP.md](docs/SETUP.md)
3. Check console logs for errors
4. Verify all prerequisites are met

---

**Happy Learning! 🎉**

Built as a comprehensive learning module for database and full-stack development education.
