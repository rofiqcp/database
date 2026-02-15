# Cassandra Learning Module

Complete full-stack CRUD application built with Node.js, Express, Vue 3, and Apache Cassandra database.

![](https://img.shields.io/badge/Database-Cassandra-blue)
![](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20Vite-brightgreen)
![](https://img.shields.io/badge/Style-TailwindCSS-blue)

## 📋 Overview

This is a comprehensive learning module demonstrating full-stack development with Apache Cassandra database. It includes a complete backend API, modern frontend UI, and extensive documentation.

## ✨ Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **RESTful API** - Well-structured Express.js backend
- ✅ **Modern Frontend** - Vue 3 with Composition API
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Search & Filter** - Advanced filtering capabilities
- ✅ **Responsive Design** - Works on all devices
- ✅ **Input Validation** - Client and server-side validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Cassandra Database** - Distributed NoSQL wide-column store

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Apache Cassandra 4.x (or Docker)
- Text editor (VS Code recommended)

### Installation

```bash
# 1. Navigate to Cassandra folder
cd Cassandra

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

## 📁 Project Structure

```
Cassandra/
├── backend/              # Node.js + Express Backend
│   ├── src/
│   │   ├── server.js    # Express app and server
│   │   ├── database.js  # Cassandra connection
│   │   └── routes.js    # API routes
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/            # Vue 3 + Vite Frontend
│   ├── src/
│   │   ├── components/  # Vue components
│   │   ├── stores/      # Pinia stores
│   │   ├── App.vue      # Main app
│   │   ├── main.js      # Entry point
│   │   └── api.js       # Axios config
│   ├── package.json
│   ├── .env.example
│   └── README.md
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
- **Database**: Apache Cassandra with cassandra-driver
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
- **[DATABASE_INFO.md](docs/DATABASE_INFO.md)** - Cassandra information
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

## 💾 Database Schema

```cql
CREATE KEYSPACE IF NOT EXISTS learning_db
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

CREATE TABLE items (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  category TEXT,
  price DECIMAL,
  quantity INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

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
CASSANDRA_CONTACT_POINTS=127.0.0.1
CASSANDRA_DATACENTER=datacenter1
CASSANDRA_KEYSPACE=learning_db
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
- Apache Cassandra database operations
- CQL (Cassandra Query Language)
- NoSQL data modeling concepts
- Distributed database concepts
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
- **Cassandra Auth**: Enable authentication and authorization in Cassandra

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) and [API_DOCS.md](docs/API_DOCS.md) for more security recommendations.

## 🤝 Use Cases

- **Learning**: Educational tool for distributed database development
- **Time-Series Data**: IoT sensor data, event logging
- **High-Write Workloads**: Analytics, user activity tracking
- **Geographically Distributed**: Multi-datacenter applications
- **Portfolio**: Showcase NoSQL full-stack skills
- **Teaching**: Teach NoSQL and distributed database concepts

## ⚠️ Limitations

- ALLOW FILTERING is used for learning; production should use materialized views
- Client-side sorting since Cassandra requires clustering keys for ORDER BY
- Single-node setup for learning; production requires multi-node cluster
- Limited ad-hoc query support compared to SQL databases
- Secondary indexes should be used sparingly in production

For applications requiring complex queries and joins, consider PostgreSQL or MySQL.

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

# Cassandra not running
nodetool status  # Check status
docker start cassandra  # If using Docker

# Database issues - recreate keyspace
cqlsh -e "DROP KEYSPACE IF EXISTS learning_db;"
# Restart backend to recreate
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
- ✅ Secondary indexing
- ✅ CQL injection prevention (prepared statements)

## 🚧 Future Enhancements

Potential additions:
- [ ] Token-based pagination
- [ ] Authentication
- [ ] File uploads
- [ ] Data visualization
- [ ] Export to CSV/PDF
- [ ] Bulk operations
- [ ] Materialized views
- [ ] Time-series data modeling
- [ ] Multi-datacenter setup

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

Built with:
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Apache Cassandra](https://cassandra.apache.org/)
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
