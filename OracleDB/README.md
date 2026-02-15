# Oracle Database Learning Module

Complete full-stack CRUD application built with Node.js, Express, Vue 3, and Oracle Database.

![](https://img.shields.io/badge/Database-OracleDB-red)
![](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20Vite-brightgreen)
![](https://img.shields.io/badge/Style-TailwindCSS-blue)

## 📋 Overview

This is a comprehensive learning module demonstrating full-stack development with Oracle Database. It includes a complete backend API, modern frontend UI, and extensive documentation.

## ✨ Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **RESTful API** - Well-structured Express.js backend
- ✅ **Modern Frontend** - Vue 3 with Composition API
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Search & Filter** - Advanced filtering capabilities
- ✅ **Responsive Design** - Works on all devices
- ✅ **Input Validation** - Client and server-side validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Oracle Database** - Enterprise ACID relational database with connection pooling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Oracle Database (XE, SE, or EE) installed and running locally
- Oracle Instant Client (if connecting remotely)
- Text editor (VS Code recommended)

### Installation

```bash
# 1. Navigate to OracleDB folder
cd OracleDB

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
# Terminal 1 - Start Oracle Database (if not already running)
# Oracle DB typically runs as a system service

# Terminal 2 - Backend (port 3000)
cd backend
npm run dev

# Terminal 3 - Frontend (port 5173)
cd frontend
npm run dev
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 📁 Project Structure

```
OracleDB/
├── backend/              # Node.js + Express Backend
│   ├── src/
│   │   ├── server.js    # Express app and server
│   │   ├── database.js  # Oracle Database connection
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
- **Database**: Oracle Database with oracledb Node.js driver
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

Oracle Database uses a relational table structure. The `items` table uses this schema:

```sql
CREATE TABLE items (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(255) NOT NULL,
  description CLOB,
  category VARCHAR2(100),
  price NUMBER(10,2) DEFAULT 0,
  quantity NUMBER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Indexes:**
- `idx_items_category` - Index on category column
- `idx_items_name` - Index on name column

## 📚 Learning Resources

This module is perfect for learning:
- Full-stack JavaScript development
- RESTful API design
- Vue 3 Composition API
- Pinia state management
- Oracle Database operations (Relational)
- Express.js backend development
- TailwindCSS styling
- Responsive design principles
- Enterprise relational databases

## 🎯 Oracle Database Key Concepts

- **Tables**: Structured data storage with defined schema
- **SQL**: Structured Query Language for data operations
- **ACID Compliance**: Atomicity, Consistency, Isolation, Durability
- **Identity Columns**: Auto-generated unique identifiers
- **Bind Variables**: Parameterized queries for security and performance
- **Connection Pooling**: Efficient connection management
- **Indexes**: Improve query performance
- **PL/SQL**: Procedural extension to SQL

---

**Happy Learning! 🎉**

Built as a comprehensive learning module for database and full-stack development education with Oracle Database.
