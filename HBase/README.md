# HBase Learning Module

Complete full-stack CRUD application built with Node.js, Express, Vue 3, and HBase database.

![](https://img.shields.io/badge/Database-HBase-orange)
![](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20Vite-brightgreen)
![](https://img.shields.io/badge/Style-TailwindCSS-blue)

## 📋 Overview

This is a comprehensive learning module demonstrating full-stack development with HBase database. It includes a complete backend API, modern frontend UI, and extensive documentation.

## ✨ Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **RESTful API** - Well-structured Express.js backend
- ✅ **Modern Frontend** - Vue 3 with Composition API
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Search & Filter** - Advanced filtering capabilities
- ✅ **Responsive Design** - Works on all devices
- ✅ **Input Validation** - Client and server-side validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **HBase Database** - NoSQL wide-column database for big data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Java JDK 8 or 11
- HBase 2.4+ installed with REST API enabled
- Text editor (VS Code recommended)

### Installation

```bash
# 1. Navigate to HBase folder
cd HBase

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
# Terminal 1 - Start HBase and REST server
$HBASE_HOME/bin/start-hbase.sh
$HBASE_HOME/bin/hbase rest start -p 8080

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
HBase/
├── backend/              # Node.js + Express Backend
│   ├── src/
│   │   ├── server.js    # Express app and server
│   │   ├── database.js  # HBase connection
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
- **Database**: HBase (via REST API with hbase npm package)
- **ID Generation**: UUID v4
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
- **[DATABASE_INFO.md](docs/DATABASE_INFO.md)** - HBase information
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

HBase uses a wide-column data model. The `items` table uses this schema:

```
Table: items
Column Family: data

Row Key: UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")

Column Qualifiers:
  data:name          String (required)    # Item name
  data:description   String               # Item description
  data:category      String               # Item category
  data:price         Number               # Item price
  data:quantity      Number               # Stock quantity
  data:created_at    ISO String           # Creation timestamp
  data:updated_at    ISO String           # Last update timestamp
```

**Key Concepts:**
- **Row Key**: UUID used as unique identifier
- **Column Family**: `data` groups all related columns
- **Column Qualifiers**: Individual fields within the column family
- **Versioning**: HBase stores multiple versions of each cell

## 📚 Learning Resources

This module is perfect for learning:
- Full-stack JavaScript development
- RESTful API design
- Vue 3 Composition API
- Pinia state management
- HBase database operations (Wide-Column NoSQL)
- Express.js backend development
- TailwindCSS styling
- Responsive design principles
- Big data database concepts

## 🎯 HBase Key Concepts

- **Tables**: Organized by row key and column families
- **Column Families**: Logical grouping of columns (must be defined at table creation)
- **Column Qualifiers**: Individual columns within a family (can be added dynamically)
- **Row Keys**: Unique identifiers for rows (sorted lexicographically)
- **Cells**: Intersection of row, column family, and qualifier (versioned)
- **Regions**: Horizontal partitions of a table (auto-split as data grows)
- **HDFS**: Underlying storage layer for data persistence
- **ZooKeeper**: Coordination service for cluster management

---

**Happy Learning! 🎉**

Built as a comprehensive learning module for database and full-stack development education with HBase.
