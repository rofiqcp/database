# Sample API Queries

All examples assume the backend is running at `http://localhost:8080`.

---

## Authentication

```bash
# Check authentication status
curl http://localhost:8080/api/auth/status

# Get the Google OAuth2 login URL
curl http://localhost:8080/api/auth/url

# Logout (delete stored tokens)
curl -X POST http://localhost:8080/api/auth/logout
```

---

## Google Drive — Files

```bash
# List all files (first 30, most recently modified first)
curl "http://localhost:8080/api/drive/files"

# List up to 10 files
curl "http://localhost:8080/api/drive/files?pageSize=10"

# Search by file name
curl "http://localhost:8080/api/drive/files?query=invoice"

# Get metadata for a specific file
curl "http://localhost:8080/api/drive/files/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"

# Download a file
curl -OJ "http://localhost:8080/api/drive/files/FILE_ID/download"

# Upload a file to Drive root
curl -X POST \
  -F "file=@/path/to/report.pdf" \
  "http://localhost:8080/api/drive/upload"

# Upload a file to a specific folder
curl -X POST \
  -F "file=@/path/to/photo.jpg" \
  -F "folderId=0B7v3SSiOLaW_SUxuSjdIQXBhUEE" \
  "http://localhost:8080/api/drive/upload"

# Move file to trash
curl -X DELETE "http://localhost:8080/api/drive/delete/FILE_ID"

# Permanently delete a file
curl -X DELETE "http://localhost:8080/api/drive/delete/FILE_ID?permanent=true"
```

---

## Google Sheets

```bash
SHEET_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"

# Get spreadsheet metadata
curl "http://localhost:8080/api/sheets/$SHEET_ID"

# Read values from a range
curl "http://localhost:8080/api/sheets/$SHEET_ID/values?range=Sheet1!A1:D10"

# Read the entire first sheet
curl "http://localhost:8080/api/sheets/$SHEET_ID/values?range=Sheet1"

# Write values (overwrite)
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"range":"Sheet1!A1","values":[["Name","Age","City"],["Alice","30","London"],["Bob","25","Paris"]]}' \
  "http://localhost:8080/api/sheets/$SHEET_ID/values"

# Append rows
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"range":"Sheet1!A1","values":[["Charlie","35","Berlin"]]}' \
  "http://localhost:8080/api/sheets/$SHEET_ID/values"

# Clear a range
curl -X DELETE "http://localhost:8080/api/sheets/$SHEET_ID/values?range=Sheet1!A2:D100"
```

---

## Google Docs

```bash
DOC_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"

# Read a document
curl "http://localhost:8080/api/docs/$DOC_ID"

# Create a new document
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"My New Report"}' \
  "http://localhost:8080/api/docs/create"

# Append text to a document
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"This paragraph was added via the API."}' \
  "http://localhost:8080/api/docs/$DOC_ID/append"

# Find and replace text
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"search":"PLACEHOLDER_DATE","replacement":"June 2024"}' \
  "http://localhost:8080/api/docs/$DOC_ID/replace"
```
