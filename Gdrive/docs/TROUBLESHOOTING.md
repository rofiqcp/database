# Troubleshooting

## Backend Issues

### `credentials.json not found`
**Symptom:** Server fails to start or `/api/auth/url` returns 500.

**Fix:**
1. Download `credentials.json` from Google Cloud Console (APIs & Services → Credentials)
2. Place it at `backend/credentials/credentials.json`
3. Ensure the path matches `google.credentials.file-path` in `application.properties`

---

### `400 Bad Request: redirect_uri_mismatch`
**Symptom:** Google returns this error after you click **Sign in with Google**.

**Fix:**
- For **Desktop app** credentials, no configuration is needed — the loopback redirect is automatic.
- For **Web application** credentials, go to Google Cloud Console → Credentials → your OAuth client and add `http://localhost:8080/api/auth/callback` to **Authorised redirect URIs**.
- Ensure `google.redirect-uri` in `application.properties` exactly matches what is registered.

---

### `403 Access blocked: This app's request is invalid`
**Symptom:** Google consent screen shows an error.

**Fix:**
- Make sure the OAuth consent screen is configured (see [GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md))
- If the app is in **Testing** status, add your Google account as a test user
- Verify the required scopes are listed on the consent screen

---

### `Token has been expired or revoked`
**Symptom:** API calls return 401 after previously working.

**Fix:**
1. Delete `backend/credentials/tokens.json` and `backend/credentials/StoredCredential`
2. Restart the backend
3. Re-authenticate via the frontend

---

### Port 8080 already in use
**Symptom:** `Address already in use: bind` on startup.

**Fix:**
```bash
# Find and kill the process using port 8080
lsof -ti:8080 | xargs kill -9
# Or change the port in application.properties
server.port=8081
```

---

### `OutOfMemoryError` during large file upload
**Symptom:** Upload fails for files over ~50 MB.

**Fix:**
Increase JVM heap in `pom.xml` or set environment variable:
```bash
MAVEN_OPTS="-Xmx512m" mvn spring-boot:run
```

---

## Frontend Issues

### CORS errors in browser console
**Symptom:** `Access to XMLHttpRequest … has been blocked by CORS policy`

**Fix:**
- Ensure the backend is running on port 8080
- Verify `application.properties` has `app.frontend.url=http://localhost:5173`
- Check the `GoogleConfig.corsConfigurer()` allows `http://localhost:5173`

---

### Blank screen / app won't load
**Symptom:** Visiting http://localhost:5173 shows a blank page.

**Fix:**
```bash
cd frontend
# Check for JavaScript errors in the browser console (F12)
# Rebuild node_modules
rm -rf node_modules
npm install
npm run dev
```

---

### `npm install` fails
**Symptom:** `ERESOLVE unable to resolve dependency tree`

**Fix:**
```bash
npm install --legacy-peer-deps
```

---

## Google API Issues

### `Daily Limit for Unauthenticated Use Exceeded`
**Symptom:** API calls return 429 or 403 quota errors.

**Fix:**
- Ensure you are authenticated (tokens are valid)
- Check [Google Cloud Console → APIs & Services → Quotas](https://console.cloud.google.com/apis/api/drive.googleapis.com/quotas)
- The Drive API free tier allows 1 billion requests per day for authenticated users; this error usually means the token is invalid

---

### Google Sheets returns empty values
**Symptom:** `GET /api/sheets/{id}/values` returns `"values": []`

**Fix:**
- Verify the range is correct (e.g., `Sheet1!A1:Z100` not just `A1:Z100`)
- Check the sheet name matches exactly (case-sensitive)
- Make sure the spreadsheet has data in the specified range

---

### `The caller does not have permission`
**Symptom:** 403 when accessing a specific file or spreadsheet.

**Fix:**
- The file/spreadsheet must be owned by or shared with the authenticated Google account
- For Sheets/Docs, ensure the Sheets/Docs APIs are enabled in Google Cloud Console
- Re-authenticate if the token was obtained before the scopes were expanded
