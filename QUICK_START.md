#🚀 Quick Start - Database Learning Modules

Panduan cepat untuk memulai setiap database learning module.

---

## 📦 Installation & Setup Workflow

### Universal Setup (Same for all databases)

```bash
# 1. Navigate ke database folder
cd "DATABASE_NAME"

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env dengan database credentials/connection string

# 3. Setup Frontend  
cd ../frontend
npm install
cp .env.example .env
# Edit .env - set VITE_API_URL=http://localhost:3000/api

# 4. Jalankan Development
# Terminal 1 (Backend) - port 3000
cd backend
npm run dev

# Terminal 2 (Frontend) - port 5173
cd frontend
npm run dev

# 5. Test in Browser
# Frontend: http://localhost:5173
# API: http://localhost:3000/api

# 6. Build untuk Production
cd backend
npm run build

cd ../frontend
npm run build
```

---

## 🗂️ Per-Database Quick Reference

### 1️⃣ Amazon Neptune
```bash
# Prerequisites
# - AWS Account & credentials configured
# - Neptune endpoint available

cd "Amazon Neptune"
cd backend
# Edit .env dengan AWS credentials & Neptune endpoint
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

### 2️⃣ Apache Solr
```bash
# Prerequisites
# - Solr running (bin/solr start)
# Default: http://localhost:8983

cd "Apache Solr"
cd backend
# .env sudah default untuk localhost:8983
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 3️⃣ Cassandra
```bash
# Prerequisites
# - Cassandra running
# - Default: localhost:9042

cd Cassandra
cd backend
# .env sudah default untuk localhost
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 4️⃣ CouchDB
```bash
# Prerequisites
# - CouchDB running (http://localhost:5984)

cd CouchDB
cd backend
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 5️⃣ DynamoDB
```bash
# Prerequisites
# - AWS Account & credentials
# - AWS SDK configured

cd DynamoDB
cd backend
# Edit .env dengan AWS credentials
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 6️⃣ Elasticsearch
```bash
# Prerequisites
# - Elasticsearch running (http://localhost:9200)

cd Elasticsearch
cd backend
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 7️⃣ Firebase
```bash
# Prerequisites
# - Firebase project created
# - Service account JSON downloaded

cd Firebase
cd backend
# .env perlu FIREBASE_CREDENTIALS_PATH atau credentials
npm install
npm run dev

cd ../frontend
npm install
# .env.example perlu API key dari Firebase
npm run dev
```

### 8️⃣ HBase
```bash
# Prerequisites
# - HBase running
# - Default: localhost:16010

cd HBase
cd backend
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 9️⃣ InfluxDB
```bash
# Prerequisites
# - InfluxDB running (http://localhost:8086)

cd InfluxDB
cd backend
# .env: INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 🔟 MariaDB
```bash
# Prerequisites
# - MariaDB running (port 3306)
# - Database & tables created

cd MariaDB
cd backend
# .env: DB_HOST=localhost, DB_USER, DB_PASSWORD, DB_NAME
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 1️⃣1️⃣ Memcached
```bash
# Prerequisites
# - Memcached running (port 11211)

cd Memcached
cd backend
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 1️⃣2️⃣ MongoDB
```bash
# Prerequisites
# - MongoDB running (port 27017)
# - Database created

cd MongoDB
cd backend
# .env: MONGODB_URI=mongodb://localhost:27017/database_name
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 1️⃣3️⃣ MongoDB Atlas
```bash
# Prerequisites
# - MongoDB Atlas cluster created
# - Connection string obtained

cd "MongoDB Atlas"
cd backend
# .env: MONGODB_URI=mongodb+srv://user:password@cluster...
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 1️⃣4️⃣ MySQL
```bash
# Prerequisites
# - MySQL running (port 3306)
# - Database & tables created

cd MySQL
cd backend
# .env: DB_HOST=localhost, DB_USER=root, DB_PASSWORD, DB_NAME
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 1️⃣5️⃣ Neo4j
```bash
# Prerequisites
# - Neo4j running (port 7687)
# - Database available

cd Neo4j
cd backend
# .env: NEO4J_URIBolt URI, NEO4J_USER, NEO4J_PASSWORD
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 1️⃣6️⃣ Oracle Database
```bash
# Prerequisites
# - Oracle DB running
# - Connection credentials available

cd "Oracle Database"
cd backend
# .env: ORACLE_HOST, ORACLE_PORT, ORACLE_DB, ORACLE_USER, ORACLE_PASSWORD
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 1️⃣7️⃣ PostgreSQL
```bash
# Prerequisites
# - PostgreSQL running (port 5432)
# - Database created

cd PostgreSQL
cd backend
# .env: DB_HOST=localhost, DB_PORT=5432, DB_NAME, DB_USER, DB_PASSWORD
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 1️⃣8️⃣ Prometheus
```bash
# Prerequisites
# - Prometheus running (port 9090)
# - Metrics endpoint available

cd Prometheus
cd backend
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 1️⃣9️⃣ Redis
```bash
# Prerequisites
# - Redis running (port 6379)

cd Redis
cd backend
# .env: REDIS_HOST=localhost, REDIS_PORT=6379
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 2️⃣0️⃣ RethinkDB
```bash
# Prerequisites
# - RethinkDB running (port 28015)
# - Database created

cd RethinkDB
cd backend
# .env: RETHINK_HOST=localhost, RETHINK_PORT=28015, RETHINK_DB
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 2️⃣1️⃣ SQL Server
```bash
# Prerequisites
# - SQL Server running
# - Database created

cd "SQL Server"
cd backend
# .env: MSSQL_SERVER, MSSQL_USER, MSSQL_PASSWORD, MSSQL_DATABASE
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 2️⃣2️⃣ SQLite
```bash
# Prerequisites
# - None required (file-based)

cd SQLite
cd backend
# .env: SQLITE_PATH=./database.db
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

### 2️⃣3️⃣ TimescaleDB
```bash
# Prerequisites
# - PostgreSQL dengan TimescaleDB extension
# - Database created

cd TimescaleDB
cd backend
# .env: DB_HOST=localhost, DB_PORT=5432, DB_NAME, DB_USER, DB_PASSWORD
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

---

## 🧪 Testing Workflow

### 1. Backend API Test
```bash
curl http://localhost:3000/api/data
```

### 2. Frontend Access
```
http://localhost:5173
```

### 3. Full CRUD Test
- ✓ GET /api/data (lihat semua data di table)
- ✓ POST /api/data (buat data baru via form)
- ✓ PUT /api/data/:id (edit data via form)
- ✓ DELETE /api/data/:id (hapus data via button)
- ✓ GET /api/data/:id (lihat detail)
- ✓ POST /api/search (filter/search data)

---

## 🏗️ Build Test

```bash
# Backend
cd backend
npm run build
# Cek apakah build berhasil tanpa error

# Frontend
cd frontend
npm run build
# Cek apakah dist/ folder terbuat dengan baik
npm run preview
# Test production build di http://localhost:4173
```

---

## 📋 Troubleshooting Quick Fixes

### Port Already in Use
```bash
# Port 3000 (Backend)
lsof -i :3000  # Find process
kill -9 <PID>   # Kill process

# Port 5173 (Frontend)
lsof -i :5173
kill -9 <PID>
```

### Database Connection Failed
```bash
# 1. Verify database running
# 2. Check .env credentials
# 3. Check DATABASE_INFO.md untuk setup guide
# 4. Check error log di backend console
```

### Module Not Found
```bash
# Regenerate node_modules
rm -rf node_modules package-lock.json
npm install
```

### API CORS Error
```bash
# Backend sudah punya CORS enabled
# Double-check VITE_API_URL di frontend .env
# Harus match dengan backend URL & port
```

---

## 📚 Documentation Files

Setiap database punya:

1. **README.md** - Overview & cara pakai
2. **SETUP.md** - Step-by-step setup guide
3. **DATABASE_INFO.md** - Database spesifik info
4. **API_DOCS.md** - API endpoints dokumentasi
5. **FEATURES.md** - Fitur yang diimplementasikan
6. **TROUBLESHOOTING.md** - Common issues & fixes

---

## 🎯 Success Indicators

- ✅ npm install berjalan tanpa error
- ✅ npm run dev start backend tanpa error
- ✅ npm run dev start frontend tanpa error
- ✅ Frontend accessible di http://localhost:5173
- ✅ Backend API responsive di http://localhost:3000/api
- ✅ CRUD operations work tanpa error
- ✅ npm run build selesai dengan sukses
- ✅ Production build bisa di-serve

---

## 🔄 Batch Testing Script (Optional)

Untuk test semua database sekaligus (simplified):

```bash
#!/bin/bash

DATABASES=("PostgreSQL" "MySQL" "MongoDB" "Redis" "SQLite")

for db in "${DATABASES[@]}"; do
  echo "Testing $db..."
  cd "$db/backend"
  npm install > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✓ $db backend: npm install OK"
  else
    echo "✗ $db backend: npm install FAILED"
  fi
  
  cd "../frontend"
  npm install > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✓ $db frontend: npm install OK"
  else
    echo "✗ $db frontend: npm install FAILED"
  fi
  
  cd "../../"
done
```

---

**Happy Learning! 🎉**

Untuk pertanyaan lebih lanjut, refer ke documentation files di masing-masing database folder.
