# SQL Server Learning Module

Complete full-stack CRUD application built with Node.js, Express, Vue 3, and SQL Server database.

![](https://img.shields.io/badge/Database-SQL%20Server-blue)
![](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20Vite-brightgreen)
![](https://img.shields.io/badge/Style-TailwindCSS-blue)

## 📋 Overview

This is a comprehensive learning module demonstrating full-stack development with SQL Server database. It includes a complete backend API, modern frontend UI, and extensive documentation.

## ✨ Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **RESTful API** - Well-structured Express.js backend
- ✅ **Modern Frontend** - Vue 3 with Composition API
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Search & Filter** - Advanced filtering capabilities
- ✅ **Responsive Design** - Works on all devices
- ✅ **Input Validation** - Client and server-side validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **SQL Server Database** - Enterprise relational database with ACID compliance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- SQL Server 2019+ installed and running (or Docker)
- Text editor (VS Code recommended)

### Installation

```bash
# 1. Navigate to SQLServer folder
cd SQLServer

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
# Terminal 1 - Start SQL Server (if not already running)
# Using Docker:
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong!Password" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

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
SQLServer/
├── backend/              # Node.js + Express Backend
│   ├── src/
│   │   ├── server.js    # Express app and server
│   │   ├── database.js  # SQL Server connection
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
- **Database**: SQL Server 2019+ with mssql Node.js driver
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
- **[DATABASE_INFO.md](docs/DATABASE_INFO.md)** - SQL Server information
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

SQL Server uses a structured table schema. The `items` table uses this schema:

```sql
CREATE TABLE items (
  id INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-incremented ID
  name NVARCHAR(255) NOT NULL,       -- Item name
  description NVARCHAR(MAX),         -- Item description
  category NVARCHAR(100),            -- Item category
  price DECIMAL(10,2) DEFAULT 0,     -- Item price
  quantity INT DEFAULT 0,            -- Stock quantity
  created_at DATETIME2 DEFAULT GETDATE(),  -- Creation timestamp
  updated_at DATETIME2 DEFAULT GETDATE()   -- Last update timestamp
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
- SQL Server database operations (Relational)
- Express.js backend development
- TailwindCSS styling
- Responsive design principles
- Enterprise relational databases

## 🎯 SQL Server Key Concepts

- **Tables**: Structured storage with defined columns and data types
- **T-SQL**: Transact-SQL, Microsoft's extended SQL language
- **IDENTITY**: Auto-incremented column for unique identifiers
- **ACID Compliance**: Atomicity, Consistency, Isolation, Durability
- **Indexes**: Improve query performance on frequently accessed columns
- **Parameterized Queries**: Prevent SQL injection attacks
- **Connection Pooling**: Efficient management of database connections

---

**Happy Learning! 🎉**

Built as a comprehensive learning module for database and full-stack development education with SQL Server.
