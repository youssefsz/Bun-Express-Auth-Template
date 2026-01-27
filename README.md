# Invoice App Server

This is the backend server for the Invoice App, built with Bun, Express, and PostgreSQL.

## Prerequisites

- Bun runtime installed
- PostgreSQL database
- Google Cloud Console project (for OAuth)

## Setup

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` (or create `.env`) and fill in the values:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/invoice_app
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_secure_random_string
   JWT_REFRESH_SECRET=another_secure_random_string
   ```

3. **Database Migration**
   Run the migration script to create the necessary tables:
   ```bash
   bun run migrate
   ```

## Running the Server

- **Development Mode**:
  ```bash
  bun run dev
  ```
- **Production Mode**:
  ```bash
  bun run start
  ```

## Mobile App Configuration

### Android
1. Create a Firebase project and add an Android app.
2. Download `google-services.json` and place it in `android/app/`.
3. Ensure your SHA-1 fingerprint is added to the Firebase console.

### iOS
1. Create an iOS app in Firebase.
2. Download `GoogleService-Info.plist` and place it in `ios/Runner/`.
3. Open `ios/Runner/Info.plist` and update `CFBundleURLTypes` with your `REVERSED_CLIENT_ID` found in `GoogleService-Info.plist`.

## API Documentation

### Auth Endpoints

- **POST /api/v1/auth/google**
  - Body: `{ "idToken": "..." }`
  - Returns: `{ "user": {...}, "accessToken": "...", "refreshToken": "..." }`

- **POST /api/v1/auth/refresh**
  - Body: `{ "refreshToken": "..." }`
  - Returns: `{ "accessToken": "..." }`

- **POST /api/v1/auth/logout**
  - Body: `{ "refreshToken": "..." }`
