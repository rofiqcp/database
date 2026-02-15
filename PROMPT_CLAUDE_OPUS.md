# Prompt Claude Opus - Database Learning Module Generator

Gunakan prompt berikut untuk setiap database. Replace `[DATABASE_NAME]`, `[DATABASE_FOLDER]`, dan bagian spesifik dengan info database yang sesuai.

---

## PROMPT MASTER - Database Learning Module

```
Saya ingin membuat learning module lengkap untuk database [DATABASE_NAME]. 

STRUKTUR FOLDER:
- [DATABASE_FOLDER]/
  - backend/          (Node.js + Express)
  - frontend/         (Vue 3 + Vite)
  - docs/            (Documentation)
  - examples/        (Code examples)

REQUIREMENTS:

1. BACKEND (Node.js + Express):
   - Setup koneksi ke [DATABASE_NAME]
   - API endpoints untuk CRUD operations:
     * GET /api/data (list semua data)
     * GET /api/data/:id (get single data)
     * POST /api/data (create data)
     * PUT /api/data/:id (update data)
     * DELETE /api/data/:id (delete data)
     * POST /api/search (search/filter data)
   - Error handling yang baik
   - Input validation
   - Response format yang konsisten
   - Package.json dengan dependencies yang jelas
   - .env.example untuk konfigurasi
   - README.md dengan setup instructions

2. FRONTEND (Vue 3 + Vite):
   - Components:
     * DataTable (tampilkan semua data)
     * CreateForm (form untuk create data)
     * EditForm (form untuk edit data)
     * SearchFilter (search dan filter UI)
     * DetailView (tampilkan detail single data)
   - State management dengan Pinia
   - Axios untuk API calls
   - TailwindCSS untuk styling
   - Loading states dan error handling
   - Dark mode toggle
   - Responsive design
   - README.md dengan setup instructions

3. DOKUMENTASI:
   - SETUP.md: Step-by-step setup guide
   - API_DOCS.md: API endpoint documentation dengan contoh
   - DATABASE_INFO.md: Info spesifik tentang [DATABASE_NAME]
   - FEATURES.md: Fitur yang tersedia
   - TROUBLESHOOTING.md: Common issues dan solutions

4. EXAMPLES:
   - sample_data.json (contoh data untuk testing)
   - query_examples.txt (contoh query untuk [DATABASE_NAME])

TEKNOLOGI YANG DIPAKAI:
Backend:
- Node.js 18+
- Express.js 4.x
- [DATABASE_DRIVER] (driver dan CLI untuk [DATABASE_NAME])
- Dotenv
- CORS
- Validator

Frontend:
- Vue 3
- Vite
- Pinia
- Axios
- TailwindCSS
- TypeScript (optional)

OUTPUT REQUIREMENT:
Berikan SEMUA kode lengkap dalam format file yang siap pakai:
1. Semua file berserta path relatifnya
2. Instruksi setup step-by-step
3. Script npm untuk development dan build
4. Contoh environment variables
5. Testing instructions

NOTES:
- [DATABASE_NAME] adalah database yang akan kami gunakan
- Gunakan best practices untuk [DATABASE_NAME]
- Documentation harus clear dan mudah diikuti
- Code harus production-ready
- Include comments di code yang penting
- Buat contoh data yang realistic

STRUKTUR RESPONSE:
Berikan output dalam format ini untuk setiap file:

## FILE: [path/filename]
\`\`\`[language]
[code content]
\`\`\`

INSTRUCTIONS:
[setup atau penjelasan khusus]

---

Mulai buatkan sekarang untuk [DATABASE_NAME]!
```

---

## INSTRUCTION UNTUK MASING-MASING DATABASE

Copy paste prompt di atas dan ganti placeholder:

### 1. **Amazon Neptune**
```
[DATABASE_NAME] = Amazon Neptune
[DATABASE_FOLDER] = Amazon Neptune
[DATABASE_DRIVER] = @aws-sdk/client-neptunedata
Note: Tambahkan AWS credentials setup
```

### 2. **Apache Solr**
```
[DATABASE_NAME] = Apache Solr
[DATABASE_FOLDER] = Apache Solr
[DATABASE_DRIVER] = solr-client
Note: Include Solr indexing examples
```

### 3. **Cassandra**
```
[DATABASE_NAME] = Apache Cassandra
[DATABASE_FOLDER] = Cassandra
[DATABASE_DRIVER] = cassandra-driver
Note: Include keyspace dan table setup
```

### 4. **CouchDB**
```
[DATABASE_NAME] = CouchDB
[DATABASE_FOLDER] = CouchDB
[DATABASE_DRIVER] = nano (CouchDB client)
Note: Include document design patterns
```

### 5. **DynamoDB**
```
[DATABASE_NAME] = AWS DynamoDB
[DATABASE_FOLDER] = DynamoDB
[DATABASE_DRIVER] = @aws-sdk/client-dynamodb
Note: Include table creation dan indexes
```

### 6. **Elasticsearch**
```
[DATABASE_NAME] = Elasticsearch
[DATABASE_FOLDER] = Elasticsearch
[DATABASE_DRIVER] = @elastic/elasticsearch
Note: Include mapping dan analyzer setup
```

### 7. **Firebase**
```
[DATABASE_NAME] = Firebase Realtime Database
[DATABASE_FOLDER] = Firebase
[DATABASE_DRIVER] = firebase-admin
Note: Include authentication setup
```

### 8. **HBase**
```
[DATABASE_NAME] = Apache HBase
[DATABASE_FOLDER] = HBase
[DATABASE_DRIVER] = hbase-client
Note: Include column families setup
```

### 9. **InfluxDB**
```
[DATABASE_NAME] = InfluxDB
[DATABASE_FOLDER] = InfluxDB
[DATABASE_DRIVER] = @influxdata/influxdb-client
Note: Include time-series specific queries
```

### 10. **MariaDB**
```
[DATABASE_NAME] = MariaDB
[DATABASE_FOLDER] = MariaDB
[DATABASE_DRIVER] = mariadb (or mysql2)
Note: Use same setup as MySQL
```

### 11. **Memcached**
```
[DATABASE_NAME] = Memcached
[DATABASE_FOLDER] = Memcached
[DATABASE_DRIVER] = memjs
Note: Include caching strategies
```

### 12. **MongoDB**
```
[DATABASE_NAME] = MongoDB
[DATABASE_FOLDER] = MongoDB
[DATABASE_DRIVER] = mongodb (driver resmi)
Note: Include schema validation dan indexing
```

### 13. **MongoDB Atlas**
```
[DATABASE_NAME] = MongoDB Atlas
[DATABASE_FOLDER] = MongoDB Atlas
[DATABASE_DRIVER] = mongodb
Note: Sama dengan MongoDB, tambah cloud connection string
```

### 14. **MySQL**
```
[DATABASE_NAME] = MySQL
[DATABASE_FOLDER] = MySQL
[DATABASE_DRIVER] = mysql2 dengan promises
Note: Include normalization examples
```

### 15. **Neo4j**
```
[DATABASE_NAME] = Neo4j
[DATABASE_FOLDER] = Neo4j
[DATABASE_DRIVER] = neo4j-driver
Note: Include Cypher query examples
```

### 16. **Oracle Database**
```
[DATABASE_NAME] = Oracle Database
[DATABASE_FOLDER] = Oracle Database
[DATABASE_DRIVER] = oracledb
Note: Include PL/SQL basics
```

### 17. **PostgreSQL**
```
[DATABASE_NAME] = PostgreSQL
[DATABASE_FOLDER] = PostgreSQL
[DATABASE_DRIVER] = pg (node-postgres)
Note: Include JSON/JSONB dan advanced features
```

### 18. **Prometheus**
```
[DATABASE_NAME] = Prometheus
[DATABASE_FOLDER] = Prometheus
[DATABASE_DRIVER] = prom-client
Note: Include metrics collection dan alerting
```

### 19. **Redis**
```
[DATABASE_NAME] = Redis
[DATABASE_FOLDER] = Redis
[DATABASE_DRIVER] = redis (v4+)
Note: Include pub/sub dan caching patterns
```

### 20. **RethinkDB**
```
[DATABASE_NAME] = RethinkDB
[DATABASE_FOLDER] = RethinkDB
[DATABASE_DRIVER] = rethinkdbdash
Note: Include real-time changefeeds
```

### 21. **SQL Server**
```
[DATABASE_NAME] = SQL Server
[DATABASE_FOLDER] = SQL Server
[DATABASE_DRIVER] = mssql (tedious)
Note: Include T-SQL basics
```

### 22. **SQLite**
```
[DATABASE_NAME] = SQLite
[DATABASE_FOLDER] = SQLite
[DATABASE_DRIVER] = sqlite3 atau better-sqlite3
Note: File-based database, include migration setup
```

### 23. **TimescaleDB**
```
[DATABASE_NAME] = TimescaleDB
[DATABASE_FOLDER] = TimescaleDB
[DATABASE_DRIVER] = pg (PostgreSQL extension)
Note: PostgreSQL extension untuk time-series
```

---

## CARA PENGGUNAAN:

1. **Pilih satu database**
2. **Copy prompt di atas**
3. **Ganti placeholder** dengan info dari tabel di atas
4. **Paste ke Claude Opus**
5. **Tunggu hingga semua file di-generate**
6. **Copy semua file ke folder masing-masing**
7. **Setup dan test build**

## CONTOH LENGKAP:

Untuk **PostgreSQL**, prompt yang di-send ke Claude Opus adalah:

```
Saya ingin membuat learning module lengkap untuk database PostgreSQL. 

STRUKTUR FOLDER:
- PostgreSQL/
  - backend/          (Node.js + Express)
  - frontend/         (Vue 3 + Vite)
  - docs/            (Documentation)
  - examples/        (Code examples)

[... lanjut dengan REQUIREMENTS, TEKNOLOGI, etc dari PROMPT MASTER di atas ...]

Note: Include JSON/JSONB dan advanced features
```

---

## LANGKAH-LANGKAH SETUP DEVELOPMENT:

Setelah file di-generate untuk setiap database:

```bash
# 1. Masuk ke folder database
cd "PostgreSQL"  # atau database lainnya

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database

# 3. Setup frontend
cd ../frontend
npm install

# 4. Development
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# 5. Build
cd backend
npm run build

cd frontend
npm run build

# 6. Production
# Backend
npm start

# Frontend (serve dist)
npm run preview
```

---

## NOTES PENTING:

- **Database Connection**: Pastikan database running sebelum start backend
- **Environment Variables**: Setup .env file dengan credentials
- **Port Default**: Backend port 3000, Frontend port 5173
- **CORS**: Backend sudah setup CORS untuk frontend
- **Validation**: Input validation sudah included
- **Error Handling**: Proper error handling di semua endpoints
- **Documentation**: Setiap folder punya README.md lengkap

---

## CHECKLIST UNTUK SETIAP DATABASE:

✓ Backend setup lengkap
✓ Frontend Vue 3 + Vite
✓ CRUD operations
✓ API documentation
✓ Database specific documentation
✓ Example data
✓ Setup instructions
✓ Error handling
✓ Input validation
✓ Package.json ready
✓ .env.example ready
✓ README.md di setiap folder

---

Goodluck! Siap generate semua 23 database! 🚀
