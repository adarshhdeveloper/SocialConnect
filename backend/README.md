# SocialConnect — Instagram Connect & Automated Publishing API

A production-ready Node.js REST API that integrates with Meta's official Instagram Graph API using Instagram Login for Business. It allows users to securely connect their Instagram Professional accounts via OAuth 2.0, publish single-image posts with captions, fetch live post permalinks, and maintain a local publishing history in SQLite.

---

## 📌 Features

- **Official Instagram Login (OAuth 2.0)**: Secure authorization without requiring a linked Facebook Page.
- **Long-Lived Tokens (60 Days)**: Automatically exchanges short-lived tokens for 60-day long-lived access tokens via Meta's `ig_exchange_token` endpoint.
- **SQLite Database Persistence**: Stores connected accounts, tokens, and post history locally using `better-sqlite3` (WAL mode). Survives server restarts.
- **Async Media Processing Engine**: Polls Instagram media container status until `FINISHED` before attempting to publish, preventing the common `"Media ID is not available"` error.
- **Live Permalink Retrieval**: Fetches and stores the direct Instagram post URL (`https://www.instagram.com/p/...`) immediately upon publishing.
- **Duplicate Protection**: Rejects duplicate posts (same image & caption) sent within 2 minutes with `409 Conflict`.
- **Database Management Endpoints**: Full CRUD control to view post history, inspect individual posts, delete records, and disconnect accounts.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: SQLite (`better-sqlite3`)
- **HTTP Client**: Axios
- **Session & Auth**: `express-session`, Node.js native `crypto`
- **Environment**: `dotenv`
- **Tunneling**: ngrok (for development HTTPS callbacks)

---

## 📂 Project Structure

```text
SocialConnect/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js              # SQLite connection, schema & auto-migrations
│   │   ├── controllers/
│   │   │   └── instaConnect.controller.js # OAuth, publishing & DB CRUD logic
│   │   ├── routes/
│   │   │   └── instagram.routes.js      # Express API routes
│   │   └── app.js                       # Express app configuration & middlewares
│   ├── .env.example                     # Sample environment configuration
│   ├── .gitignore                       # Git ignore rules (DB, node_modules, secrets)
│   ├── package.json
│   └── server.js                        # App entry point
└── README.md
```

---

## ⚙️ Prerequisites & Setup

### 1. Clone the repository
```bash
git clone https://github.com/adarshhdeveloper/SocialPoster.git
cd SocialPoster/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_random_session_secret_here

# Meta Developer App Credentials
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_API_VERSION=v26.0
META_REDIRECT_URI=https://your-ngrok-domain.ngrok-free.dev/api/instagram/callback
```

---

## 🌐 Meta App & ngrok Setup

1. **Create App**: Go to [Meta for Developers](https://developers.facebook.com/) and create an app with the **Instagram** use case.
2. **Add Instagram Login**: Set up **Instagram API with Instagram Login**.
3. **Tester Account**: Add your Professional Instagram account (Creator or Business) as an **Instagram Tester** in the app roles, and accept the invite inside Instagram settings (*Settings > Website Permissions > Apps and Websites > Tester Invites*).
4. **Permissions Configured**:
   - `instagram_business_basic`
   - `instagram_business_content_publish`
5. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```
6. **Set Redirect URI**: Copy your ngrok HTTPS forwarding URL and add it in Meta App Dashboard under **Instagram Login > Settings > Valid OAuth Redirect URIs**:
   ```text
   https://your-ngrok-domain.ngrok-free.dev/api/instagram/callback
   ```
   Also update `META_REDIRECT_URI` in your `.env`.

---

## 🚀 Running the Server

Start in development mode with nodemon:
```bash
npm run dev
```

Output:
```text
SQLite database connected and migrations applied
Server is running on port 3000
```

---

## 🔌 API Reference & Endpoints

### 1. Health Check
Checks if the backend server is running.
- **Method**: `GET`
- **URL**: `/health`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "SocialConnect API is running"
  }
  ```

---

### 2. Connect Instagram Account (OAuth)
Initiates the OAuth flow. Open this URL directly in your web browser.
- **Method**: `GET`
- **URL**: `/api/instagram/connect`
- **Flow**: Generates a random cryptographic `state`, stores it in session, and redirects to Instagram's authorization page.
- **Callback URL**: `/api/instagram/callback`
- **Response**: Exchanging authorization code -> Fetches 60-day token -> Persists to SQLite.
  ```text
  Instagram connected successfully! Token and account saved permanently in database.
  ```

---

### 3. Get Authenticated User Profile
Returns currently connected Instagram identity (tokens are never returned).
- **Method**: `GET`
- **URL**: `/api/instagram/me`
- **Response `200 OK`**:
  ```json
  {
    "connected": true,
    "igUserId": "17841400000000000",
    "username": "demo_creator"
  }
  ```

---

### 4. Publish Post to Instagram
Creates a container on Instagram, waits for processing, and publishes the photo.
- **Method**: `POST`
- **URL**: `/api/instagram/posts`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg",
    "caption": "Testing SocialConnect Auto Publishing API! 🚀 #nodejs #instagramapi"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "status": "published",
    "mediaId": "18134206705678446",
    "permalink": "https://www.instagram.com/p/DBqX1..."
  }
  ```

---

### 5. Get Posts History
Returns the latest 10 posts stored in SQLite.
- **Method**: `GET`
- **URL**: `/api/instagram/posts`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 1,
    "posts": [
      {
        "id": 1,
        "ig_user_id": "17841400000000000",
        "image_url": "https://...",
        "caption": "Testing SocialConnect...",
        "container_id": "179...",
        "media_id": "18134206705678446",
        "permalink": "https://www.instagram.com/p/DBqX1...",
        "status": "published",
        "error": null,
        "created_at": "2026-10-25 17:45:00"
      }
    ]
  }
  ```

---

### 6. Get Single Post by ID
- **Method**: `GET`
- **URL**: `/api/instagram/posts/:id`
- **Response `200 OK`**: Returns the specific post details.

---

### 7. Delete Post from Database
Deletes a post record from local database history (does not delete from live Instagram).
- **Method**: `DELETE`
- **URL**: `/api/instagram/posts/:id`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Post record with ID 1 deleted successfully from database"
  }
  ```

---

### 8. List Connected Accounts
- **Method**: `GET`
- **URL**: `/api/instagram/accounts`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 1,
    "accounts": [
      {
        "id": 1,
        "ig_user_id": "17841400000000000",
        "username": "demo_creator",
        "token_expires_at": "2026-12-24T17:45:00.000Z",
        "created_at": "2026-10-25 17:45:00",
        "updated_at": "2026-10-25 17:45:00"
      }
    ]
  }
  ```

---

### 9. Disconnect Account
Removes the account from the database and clears the server session.
- **Method**: `DELETE`
- **URL**: `/api/instagram/accounts/:igUserId`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Instagram account 17841400000000000 disconnected and deleted from database"
  }
  ```

---

## 🧪 Security & Edge Cases Handled

| Scenario | Input / Action | Result |
|---|---|---|
| **Invalid Image URL** | Non-HTTPS link or missing string | `400 Bad Request` ("A public HTTPS imageUrl and caption are required") |
| **Oversized Caption** | Caption > 2200 characters | `400 Bad Request` ("Caption must be 2200 characters or fewer") |
| **Duplicate Publishing** | Same image + caption submitted within 2 minutes | `409 Conflict` ("Duplicate post detected...") |
| **Server Restart** | Nodemon or server process restarted | Session restores credentials from SQLite database fallback automatically |
| **Expired Tokens** | Short-lived token expires after 1 hr | Token is converted to 60-day long-lived token upon connect |
| **Media Processing Delay** | Meta takes 2-5s to download image | Polling loop waits until container status is `FINISHED` before publishing |

---

## 💡 Troubleshooting & Key Engineering Learnings

1. **Meta Container Asynchronous Processing (`Media ID is not available`):**
   - *Problem*: Directly publishing an Instagram container right after creation returns an OAuthException error (`code: 9007, "Media ID is not available"`).
   - *Solution*: Container creation is asynchronous on Meta's servers. Implemented a status polling loop (`GET /{containerId}?fields=status_code`) that checks every 3 seconds until status transitions from `IN_PROGRESS` to `FINISHED`.

2. **In-Memory Session Loss on Restart:**
   - *Problem*: Default `express-session` stores tokens in memory. Every server restart or nodemon reload wiped the user's active session, returning `401 Connect Instagram first`.
   - *Solution*: Persisted accounts, user IDs, and tokens in a dedicated SQLite table (`instagram_accounts`). Added an automated fallback: if session variables are absent, the controllers automatically resolve active credentials from SQLite.

3. **Instagram Image Accessibility & Redirects:**
   - *Problem*: URLs with dynamic image query parameters or redirect-heavy CDNs (like Unsplash dynamic queries) frequently fail Meta's crawler with *"Only photo or video can be accepted as media type"*.
   - *Solution*: Meta requires direct, publicly reachable JPEG images. Using static direct URLs or static Wikimedia links resolves cleanly every time.
