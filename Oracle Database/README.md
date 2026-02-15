# Oracle Database Learning Module

Complete full-stack CRUD application built with Node.js, Express, Vue 3, and Oracle Database.

![](https://img.shields.io/badge/Database-Oracle-red)
![](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20Vite-brightgreen)
![](https://img.shields.io/badge/Style-TailwindCSS-blue)

## 📋 Overview

This is a comprehensive learning module demonstrating full-stack development with Oracle Database. It includes a complete backend API with connection pooling, modern frontend UI, and extensive documentation covering Oracle architecture, PL/SQL, and enterprise features.

## ✨ Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **RESTful API** - Well-structured Express.js backend
- ✅ **Modern Frontend** - Vue 3 with Composition API
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Search & Filter** - Advanced filtering capabilities
- ✅ **Responsive Design** - Works on all devices
- ✅ **Input Validation** - Client and server-side validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Oracle Database** - Enterprise-grade relational database with connection pooling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Oracle Database (XE recommended for learning)
- Text editor (VS Code recommended)

### Installation

```bash
# 1. Navigate to Oracle Database folder
cd "Oracle Database"

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
Oracle Database/
├── backend/              # Node.js + Express Backend
│   ├── src/
│   │   ├── server.js    # Express app and server
│   │   ├── database.js  # Oracle connection pool
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
- **Database**: Oracle Database with oracledb driver
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
- **[DATABASE_INFO.md](docs/DATABASE_INFO.md)** - Oracle Database information
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

```sql
-- Sequence for auto-increment
CREATE SEQUENCE items_seq START WITH 1 INCREMENT BY 1;

-- Table definition
CREATE TABLE items (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(255) NOT NULL,
  description CLOB,
  category VARCHAR2(100),
  price NUMBER(10,2),
  quantity NUMBER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-increment trigger
CREATE OR REPLACE TRIGGER items_bi
BEFORE INSERT ON items
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT items_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/
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
ORACLE_USER=system
ORACLE_PASSWORD=oracle
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
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
- Oracle Database operations
- PL/SQL and Oracle-specific SQL
- Connection pooling patterns
- Enterprise database concepts
- Express.js backend development
- TailwindCSS styling

## 🏢 Oracle Database Concepts Covered

- **Architecture**: SGA, PGA, tablespaces, background processes
- **PL/SQL**: Procedures, functions, packages, triggers
- **Sequences**: Auto-increment with sequences and triggers
- **Connection Pooling**: Efficient connection management
- **Bind Variables**: SQL injection prevention and performance
- **Enterprise Features**: RAC, Data Guard, partitioning overview
- **Oracle XE**: Free Express Edition for learning

## ⚠️ Security Note

This is a **learning module** designed for educational purposes. For production deployment, consider adding:

- **Rate Limiting**: Prevent API abuse (see API_DOCS.md for examples)
- **Authentication**: Add user authentication and authorization
- **HTTPS**: Use SSL/TLS in production
- **Input Sanitization**: Already included, but review for your use case
- **Environment Security**: Secure your .env files and credentials
- **CORS**: Configure CORS_ORIGIN for production domains
- **Oracle Security**: Use dedicated application user with minimal privileges

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) and [API_DOCS.md](docs/API_DOCS.md) for more security recommendations.

## 🤝 Use Cases

- **Learning**: Educational tool for Oracle Database and full-stack development
- **Enterprise**: Foundation for enterprise application development
- **Financial**: Banking and financial application prototyping
- **Healthcare**: Medical record system prototyping
- **Portfolio**: Showcase full-stack and Oracle Database skills
- **Teaching**: Teach web development and database concepts

## ⚠️ Limitations

- Oracle XE has resource limits (2GB RAM, 12GB storage, 2 CPU threads)
- Requires Oracle Database installation (Docker recommended)
- Commercial licensing for Oracle Enterprise/Standard Edition
- Heavier resource requirements compared to SQLite or PostgreSQL

For lightweight development, consider SQLite. For open-source production, consider PostgreSQL.

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

# Oracle connection issues
docker restart oracle-xe  # If using Docker
lsnrctl status           # Check listener
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
- ✅ Database indexing
- ✅ SQL injection prevention (bind variables)
- ✅ Connection pooling
- ✅ Resource cleanup (connection release)

## 🚧 Future Enhancements

Potential additions:
- [ ] Pagination (FETCH FIRST / OFFSET)
- [ ] Authentication
- [ ] File uploads
- [ ] Data visualization
- [ ] Export to CSV/PDF
- [ ] Bulk operations
- [ ] PL/SQL stored procedures
- [ ] Oracle Text full-text search
- [ ] Table partitioning

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

Built with:
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Oracle Database](https://www.oracle.com/database/)
- [node-oracledb](https://oracle.github.io/node-oracledb/)
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

Built as a comprehensive learning module for Oracle Database and full-stack development education.
