# MongoDB Learning Module

Complete full-stack CRUD application built with Node.js, Express, Vue 3, and MongoDB database.

![](https://img.shields.io/badge/Database-MongoDB-green)
![](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![](https://img.shields.io/badge/Frontend-Vue%203%20%2B%20Vite-brightgreen)
![](https://img.shields.io/badge/Style-TailwindCSS-blue)

## 📋 Overview

This is a comprehensive learning module demonstrating full-stack development with MongoDB database. It includes a complete backend API, modern frontend UI, and extensive documentation.

## ✨ Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **RESTful API** - Well-structured Express.js backend
- ✅ **Modern Frontend** - Vue 3 with Composition API
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Search & Filter** - Advanced filtering capabilities
- ✅ **Responsive Design** - Works on all devices
- ✅ **Input Validation** - Client and server-side validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **MongoDB Database** - NoSQL document database with flexible schema

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+ installed and running locally
- Text editor (VS Code recommended)

### Installation

\`\`\`bash
# 1. Navigate to MongoDB folder
cd MongoDB

# 2. Setup Backend
cd backend
npm install
cp .env.example .env

# 3. Setup Frontend
cd ../frontend
npm install
cp .env.example .env
\`\`\`

### Run Development Servers

\`\`\`bash
# Terminal 1 - Start MongoDB (if not already running)
mongod

# Terminal 2 - Backend (port 3000)
cd backend
npm run dev

# Terminal 3 - Frontend (port 5173)
cd frontend
npm run dev
\`\`\`

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 📁 Project Structure

\`\`\`
MongoDB/
├── backend/              # Node.js + Express Backend
│   ├── src/
│   │   ├── server.js    # Express app and server
│   │   ├── database.js  # MongoDB connection
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
\`\`\`

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 6+ with official Node.js driver
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

Comprehensive documentation is available in the \`docs/\` folder:

- **[SETUP.md](docs/SETUP.md)** - Complete setup instructions
- **[API_DOCS.md](docs/API_DOCS.md)** - API endpoint documentation
- **[DATABASE_INFO.md](docs/DATABASE_INFO.md)** - MongoDB information
- **[FEATURES.md](docs/FEATURES.md)** - Feature list
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/data\` | Get all items |
| GET | \`/api/data/:id\` | Get single item |
| POST | \`/api/data\` | Create new item |
| PUT | \`/api/data/:id\` | Update item |
| DELETE | \`/api/data/:id\` | Delete item |
| POST | \`/api/search\` | Search/filter items |
| GET | \`/health\` | Health check |

Full API documentation: [API_DOCS.md](docs/API_DOCS.md)

## 🎨 Frontend Components

- **DataTable** - Display all items in table format
- **CreateForm** - Form to create new items
- **EditForm** - Form to edit existing items
- **DetailView** - Display detailed item information
- **SearchFilter** - Advanced search and filtering UI

## 💾 Database Schema

MongoDB uses a flexible document structure. The \`items\` collection uses this schema:

\`\`\`javascript
{
  _id: ObjectId,              // Auto-generated MongoDB ID
  name: String (required),    // Item name
  description: String,        // Item description
  category: String,           // Item category
  price: Number,              // Item price
  quantity: Number,           // Stock quantity
  created_at: ISODate,        // Creation timestamp
  updated_at: ISODate         // Last update timestamp
}
\`\`\`

**Indexes:**
- \`category\` - Single field index
- \`name\` - Single field index
- \`created_at\` - Single field index (descending)
- \`name, description\` - Text index for full-text search

## 📚 Learning Resources

This module is perfect for learning:
- Full-stack JavaScript development
- RESTful API design
- Vue 3 Composition API
- Pinia state management
- MongoDB database operations (NoSQL)
- Express.js backend development
- TailwindCSS styling
- Responsive design principles
- Document-oriented databases

## 🎯 MongoDB Key Concepts

- **Collections**: Similar to tables in SQL, but schema-less
- **Documents**: JSON-like objects stored in collections
- **ObjectId**: Auto-generated unique identifier (_id)
- **Flexible Schema**: Documents in same collection can have different fields
- **Indexes**: Improve query performance
- **Aggregation Pipeline**: Powerful data processing framework
- **Text Search**: Built-in full-text search capabilities

---

**Happy Learning! 🎉**

Built as a comprehensive learning module for database and full-stack development education with MongoDB.
