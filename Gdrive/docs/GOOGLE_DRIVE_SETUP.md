# Google Cloud Console Setup

This guide walks you through creating the credentials required for the Google Drive integration.
The process takes about 10 minutes and only needs to be done once.

---

## 1. Create a Google Cloud Project

1. Navigate to https://console.cloud.google.com/
2. Click the project dropdown at the top of the page
3. Click **New Project**
4. Enter a name (e.g., `gdrive-manager`) and click **Create**
5. Select the new project from the dropdown

---

## 2. Enable the Required APIs

You need three APIs: Drive, Sheets, and Docs.

### Google Drive API
1. In the left sidebar go to **APIs & Services → Library**
2. Search for **Google Drive API**
3. Click on it and press **Enable**

### Google Sheets API
1. Return to **APIs & Services → Library**
2. Search for **Google Sheets API**
3. Click and press **Enable**

### Google Docs API
1. Return to **APIs & Services → Library**
2. Search for **Google Docs API**
3. Click and press **Enable**

---

## 3. Configure the OAuth Consent Screen

Before creating credentials you must set up the OAuth consent screen.

1. Go to **APIs & Services → OAuth consent screen**
2. Select **External** as the user type (allows any Google account to log in)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: `GDrive Manager` (or any name)
   - **User support email**: your email address
   - **Developer contact information**: your email address
5. Click **Save and Continue**

### Add Scopes
6. On the **Scopes** step click **Add or Remove Scopes**
7. In the filter box enter `drive` and select:
   - `https://www.googleapis.com/auth/drive` — See, edit, create, and delete all Google Drive files
8. Enter `sheets` and select:
   - `https://www.googleapis.com/auth/spreadsheets` — See, edit, create, and delete all spreadsheets
9. Enter `docs` and select:
   - `https://www.googleapis.com/auth/documents` — See, edit, create, and delete all Google Docs
10. Click **Update**, then **Save and Continue**

### Add Test Users (while in Testing status)
11. On the **Test users** step click **Add Users**
12. Enter the Google account(s) that will use the app
13. Click **Save and Continue**, then **Back to Dashboard**

> ℹ️ While the app is in **Testing** status, only listed test users can authenticate.
> To allow any Google account, publish the app (requires Google's verification for sensitive scopes,
> but for personal/internal use Testing mode is sufficient).

---

## 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. For **Application type** select **Desktop app**
4. Enter a name (e.g., `GDrive Backend`) and click **Create**
5. A dialog shows your **Client ID** and **Client Secret** — click **Download JSON**
6. Rename the downloaded file to `credentials.json`
7. Copy it to the backend credentials directory:
   ```
   backend/credentials/credentials.json
   ```

> ⚠️ Keep this file secret. Never commit it to source control.

---

## 5. Add the Redirect URI

The Desktop app credentials type does not use a redirect URI from the console,
but our backend uses the **loopback redirect** mechanism.  The default
`http://localhost:8080/api/auth/callback` is automatically allowed for Desktop
app credentials.

If you chose **Web application** type instead:
1. On the credentials page click on your OAuth client
2. Under **Authorised redirect URIs** click **Add URI**
3. Enter `http://localhost:8080/api/auth/callback`
4. Click **Save**

---

## 6. Verify the Setup

```bash
# The file should exist and contain "installed" (Desktop app) or "web"
cat backend/credentials/credentials.json | python3 -m json.tool | head -5
```

Expected output for Desktop app:
```json
{
    "installed": {
        "client_id": "123456789-abc.apps.googleusercontent.com",
        "client_secret": "GOCSPX-...",
```

---

## 7. First Login

Start the backend (`mvn spring-boot:run` in `backend/`) and the frontend (`npm run dev` in `frontend/`),
then open http://localhost:5173 and click **Sign in with Google**.

After granting consent, `backend/credentials/tokens.json` is created automatically.
Subsequent startups load tokens from that file — **you won't be asked to log in again**.
