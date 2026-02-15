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
- ✅ **Cassandra Database** - NoSQL wide-column database with distributed architecture

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Apache Cassandra 4+ installed and running locally
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
# Terminal 1 - Start Cassandra (if not already running)
cassandra

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

Cassandra uses a wide-column store model. The `items` table uses this schema:

```cql
CREATE TABLE items (
  id uuid PRIMARY KEY,        -- UUID primary key
  name text,                   -- Item name
  description text,            -- Item description
  category text,               -- Item category
  price decimal,               -- Item price
  quantity int,                -- Stock quantity
  created_at timestamp,        -- Creation timestamp
  updated_at timestamp         -- Last update timestamp
);
```

**Indexes:**
- `idx_items_category` - Secondary index on category field

## 📚 Learning Resources

This module is perfect for learning:
- Full-stack JavaScript development
- RESTful API design
- Vue 3 Composition API
- Pinia state management
- Cassandra database operations (NoSQL)
- Express.js backend development
- TailwindCSS styling
- Responsive design principles
- Wide-column databases

## 🎯 Cassandra Key Concepts

- **Keyspace**: Similar to a database in SQL, contains tables
- **Tables**: Store rows with defined columns
- **Partition Key**: Determines data distribution across nodes
- **Clustering Key**: Determines sort order within a partition
- **CQL**: Cassandra Query Language (similar to SQL)
- **Replication**: Data copied across multiple nodes
- **Consistency Levels**: Tunable read/write consistency
- **Secondary Indexes**: Allow querying by non-primary key columns

---

**Happy Learning! 🎉**

Built as a comprehensive learning module for database and full-stack development education with Apache Cassandra.
