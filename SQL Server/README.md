# SQL Server Learning Module

Complete full-stack CRUD application built with Node.js, Express, Vue 3, and SQL Server database.

![](https://img.shields.io/badge/Database-SQL%20Server-red)
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
- ✅ **SQL Server Database** - Enterprise-grade ACID-compliant database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- SQL Server (Express, Standard, Enterprise, or Docker)
- Text editor (VS Code recommended)

### SQL Server Setup

#### Docker (Recommended)
```bash
docker run -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Create the database
docker exec -it sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" -C \
  -Q "CREATE DATABASE learning_db"
```

### Installation

```bash
# 1. Navigate to SQL Server folder
cd "SQL Server"

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
SQL Server/
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
- **Database**: SQL Server with mssql driver
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

```sql
CREATE TABLE items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  category NVARCHAR(100),
  price DECIMAL(10,2),
  quantity INT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
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
MSSQL_SERVER=localhost
MSSQL_PORT=1433
MSSQL_USER=sa
MSSQL_PASSWORD=YourStrong@Passw0rd
MSSQL_DATABASE=learning_db
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
- SQL Server database operations
- T-SQL query language
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
- **Encrypted Connections**: Enable SQL Server encryption

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) and [API_DOCS.md](docs/API_DOCS.md) for more security recommendations.

## 🤝 Use Cases

- **Enterprise Apps**: Business applications with SQL Server backend
- **Windows Ecosystem**: Integration with Microsoft technologies
- **Business Intelligence**: BI and analytics workloads
- **Learning**: Educational tool for full-stack development
- **Prototyping**: Quick application prototyping with enterprise database
- **Portfolio**: Showcase full-stack skills

## ⚠️ Limitations

- SQL Server Express is limited to 1 GB RAM and 10 GB database
- Requires SQL Server instance (not zero-config like SQLite)
- Higher resource usage than lightweight databases
- Full features require paid license (Express/Developer editions are free)

For lightweight applications, consider SQLite. For open-source alternatives, consider PostgreSQL.

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

# SQL Server connection issues
# Verify SQL Server is running and accessible on port 1433
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT 1"
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
- ✅ SQL injection prevention (parameterized queries)
- ✅ Connection pooling

## 🚧 Future Enhancements

Potential additions:
- [ ] Pagination with OFFSET-FETCH
- [ ] Authentication
- [ ] Stored procedures
- [ ] File uploads
- [ ] Data visualization
- [ ] Export to CSV/PDF
- [ ] Bulk operations
- [ ] Advanced filtering
- [ ] User preferences

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

Built with:
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/)
- [TailwindCSS](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/)
- [mssql](https://github.com/tediousjs/node-mssql)

## 📞 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Review [SETUP.md](docs/SETUP.md)
3. Check console logs for errors
4. Verify all prerequisites are met

---

**Happy Learning! 🎉**

Built as a comprehensive learning module for database and full-stack development education.
