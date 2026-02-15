# Development Guide - 23 Database Learning Modules

## Overview
File ini menjelaskan cara membuat learning module lengkap untuk 23 database dengan backend Node.js + Express dan frontend Vue 3 + Vite.

## 📋 Daftar 23 Database

| No | Database | Type | Driver | Port |
|----|----------|------|--------|------|
| 1 | Amazon Neptune | Graph | @aws-sdk/client-neptunedata | 8182 |
| 2 | Apache Solr | Search | solr-client | 8983 |
| 3 | Cassandra | NoSQL | cassandra-driver | 9042 |
| 4 | CouchDB | NoSQL | nano | 5984 |
| 5 | DynamoDB | NoSQL | @aws-sdk/client-dynamodb | - |
| 6 | Elasticsearch | Search | @elastic/elasticsearch | 9200 |
| 7 | Firebase | NoSQL | firebase-admin | - |
| 8 | HBase | NoSQL | hbase-client | 16010 |
| 9 | InfluxDB | TimeSeries | @influxdata/influxdb-client | 8086 |
| 10 | MariaDB | SQL | mariadb | 3306 |
| 11 | Memcached | Cache | memjs | 11211 |
| 12 | MongoDB | NoSQL | mongodb | 27017 |
| 13 | MongoDB Atlas | NoSQL | mongodb | Cloud |
| 14 | MySQL | SQL | mysql2 | 3306 |
| 15 | Neo4j | Graph | neo4j-driver | 7687 |
| 16 | Oracle Database | SQL | oracledb | 1521 |
| 17 | PostgreSQL | SQL | pg | 5432 |
| 18 | Prometheus | TimeSeries | prom-client | 9090 |
| 19 | Redis | Cache | redis | 6379 |
| 20 | RethinkDB | NoSQL | rethinkdbdash | 28015 |
| 21 | SQL Server | SQL | mssql/tedious | 1433 |
| 22 | SQLite | SQL | sqlite3 | File |
| 23 | TimescaleDB | TimeSeries | pg | 5432 |

---

## 🎯 Workflow Generation

### Step 1: Generate Prompt
Gunakan PROMPT_CLAUDE_OPUS.md

### Step 2: Create Folder Structure
```
[DATABASE_NAME]/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── dataController.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── utils/
│   │   │   └── validators.js
│   │   └── app.js
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── README.md
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DataTable.vue
│   │   │   ├── CreateForm.vue
│   │   │   ├── EditForm.vue
│   │   │   ├── SearchFilter.vue
│   │   │   └── DetailView.vue
│   │   ├── stores/
│   │   │   └── dataStore.js
│   │   ├── views/
│   │   │   ├── Home.vue
│   │   │   ├── Create.vue
│   │   │   └── Edit.vue
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   ├── .gitignore
│   ├── README.md
│   └── index.html
├── docs/
│   ├── SETUP.md
│   ├── API_DOCS.md
│   ├── DATABASE_INFO.md
│   ├── FEATURES.md
│   └── TROUBLESHOOTING.md
└── examples/
    ├── sample_data.json
    └── query_examples.txt
```

### Step 3: Send to Claude Opus
Kirim prompt dengan database spesifik.

### Step 4: Copy Files
Copy semua file yang di-generate ke folder yang sesuai.

### Step 5: Install Dependencies
```bash
cd [DATABASE]/backend
npm install

cd ../frontend
npm install
```

### Step 6: Setup Environment
```bash
# Backend
cp .env.example .env
# Edit .env dengan database credentials

# Frontend
cp .env.example .env
# Edit .env dengan API URL
```

### Step 7: Setup Database
Jalankan database server terlebih dahulu (sesuai jenis database).

### Step 8: Development Testing
```bash
# Terminal 1 - Backend
cd [DATABASE]/backend
npm run dev

# Terminal 2 - Frontend
cd [DATABASE]/frontend
npm run dev
```

### Step 9: Build Testing
```bash
# Backend
cd [DATABASE]/backend
npm run build

# Frontend
cd [DATABASE]/frontend
npm run build
```

---

## 📝 Default Package.json - Backend

```json
{
  "name": "[database-name]-backend",
  "version": "1.0.0",
  "description": "Learning module backend for [Database Name]",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "build": "echo 'Build complete'",
    "start": "node server.js",
    "test": "echo 'No tests specified yet'"
  },
  "keywords": ["[database-name]", "nodejs", "express"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "[database-driver]": "[latest]"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 📝 Default Package.json - Frontend

```json
{
  "name": "[database-name]-frontend",
  "version": "1.0.0",
  "description": "Learning module frontend for [Database Name]",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore"
  },
  "dependencies": {
    "vue": "^3.3.7",
    "axios": "^1.6.2",
    "pinia": "^2.1.6"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.7",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## 🚀 Quick Commands Reference

### Backend Development
```bash
npm install                # Install dependencies
npm run dev               # Start development server
npm start                 # Start production server
npm run build            # Create build
```

### Frontend Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (Vite)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
```

---

## ✅ Verification Checklist per Database

Setelah generate setiap database, cek:

- [ ] Backend folder ada dan lengkap
- [ ] Frontend folder ada dan lengkap
- [ ] Docs folder dengan semua markdown files
- [ ] Examples folder dengan sample data
- [ ] package.json di backend dan frontend
- [ ] .env.example di kedua folder
- [ ] README.md di setiap folder
- [ ] All dependencies bisa install (npm install)
- [ ] Backend bisa start (npm run dev)
- [ ] Frontend bisa start (npm run dev)
- [ ] Backend API berse responsif
- [ ] Frontend Vue components render dengan baik
- [ ] CRUD operations berfungsi
- [ ] Error handling bekerja
- [ ] Validation bekerja
- [ ] Database connection berhasil
- [ ] Build bisa jalan (npm run build)
- [ ] Documentation lengkap dan jelas

---

## 🔄 Batch Processing Approach

Untuk efisiensi, bisa generate multiple databases:

1. **Day 1**: Generate 5 databases (Neptune, Solr, Cassandra, CouchDB, DynamoDB)
2. **Day 2**: Generate 5 databases (Elasticsearch, Firebase, HBase, InfluxDB, MariaDB)
3. **Day 3**: Generate 5 databases (Memcached, MongoDB, MongoDB Atlas, MySQL, Neo4j)
4. **Day 4**: Generate 5 databases (Oracle, PostgreSQL, Prometheus, Redis, RethinkDB)
5. **Day 5**: Generate 3 databases (SQL Server, SQLite, TimescaleDB)

Setiap day:
- Generate all in sequence
- Copy files ke masing-masing folder
- Test semua npm install
- Test semua npm run dev (dengan timeout 30 detik)
- Document yang error

---

## 📊 Success Metrics

Ketika semua 23 database sudah selesai:

- ✓ 23 folder dengan struktur lengkap
- ✓ 23 backend dengan Express API
- ✓ 23 frontend dengan Vue + Vite
- ✓ 69 documentation files
- ✓ 23 examples dengan sample data
- ✓ Semua npm install bisa jalan
- ✓ Semua npm run dev bisa start
- ✓ Semua npm run build bisa selesai
- ✓ Total code examples untuk 23 database
- ✓ Ready untuk learning/education

---

## 🎓 Learning Path

Setiap module bisa di-use untuk:

1. **Understanding the Database**
   - Baca DATABASE_INFO.md
   - Lihat SETUP.md
   
2. **Hands-on Development**
   - Jalankan backend & frontend
   - Eksperimen dengan API endpoints
   - Modifikasi Vue components
   
3. **Advanced Learning**
   - Baca API_DOCS.md
   - Lihat query_examples.txt
   - Baca FEATURES.md
   
4. **Troubleshooting**
   - Check TROUBLESHOOTING.md
   - Test dengan sample data
   
5. **Production Ready**
   - Review kode di backend & frontend
   - Setup untuk production
   - Deploy ke environment

---

## 🔗 Additional Resources

Per database, include links ke:
- Official documentation
- npm package documentation
- Tutorial/guides
- Community resources

---

Siap untuk generate 23 database learning modules! 🎉
