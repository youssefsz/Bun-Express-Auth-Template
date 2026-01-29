# Bun Express Auth Template

A professional and lightweight authentication server template built with Bun, Express, and PostgreSQL. This project provides a secure foundation for mobile and web applications requiring Google Sign In and JWT based session management.

## Features

- **Runtime**: High performance server powered by Bun.
- **Framework**: Express.js with TypeScript for robust API development.
- **Authentication**: Google OAuth 2.0 integration and JWT (Access & Refresh Tokens) management.
- **Database**: PostgreSQL with connection pooling and raw SQL migrations.
- **Validation**: Strict request validation using Zod.
- **Security**: Enhanced security headers with Helmet and CORS configuration.
- **Account Management**: Built-in support for retrieving user profile and account deletion.

## Prerequisites

Ensure you have the following installed:

- Bun runtime
- PostgreSQL database
- Google Cloud Console project (for OAuth credentials)

## Getting Started

Follow these steps to set up the server locally.

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Rename `.env.example` to `.env` and update the values with your configuration:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/invoice_app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_secure_random_string
JWT_REFRESH_SECRET=another_secure_random_string
```

### 3. Database Migration

Initialize the database schema by running the migration script:

```bash
bun run migrate
```

### 4. Run the Server

Start the server in development mode with hot reloading:

```bash
bun run dev
```

For production deployment:

```bash
bun run start
```

## API Overview

The server exposes the following authentication endpoints under `/api/v1/auth`:

- `POST /google`: Authenticates a user via Google ID token. Returns access and refresh tokens.
- `POST /refresh`: Refreshes an expired access token using a valid refresh token.
- `POST /logout`: Invalidates the user session.
- `GET /me`: Retrieves the currently authenticated user's profile information.
- `DELETE /me`: Permanently deletes the authenticated user's account and associated data.

## Client Configuration (Crucial)

To ensure this server works with both **Web** and **Mobile** (Android/iOS) clients, you must configure your clients correctly:

### Web Client
- Use the `GOOGLE_CLIENT_ID` from your `.env` file in your frontend Google Sign-In configuration.

### Mobile Client (Android/iOS)
- When configuring Google Sign-In on mobile, you must set the `serverClientId` (sometimes called `requestIdToken` or `webClientId`) to the **SAME** `GOOGLE_CLIENT_ID` used in your server's `.env`.
- **Do not** use the Android or iOS specific Client IDs for the token request; those are for the app's identification, but the *token* must be issued for the backend server.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Created by [Youssef Dhibi](https://youssef.tn)

[GitHub Repository](https://github.com/youssefsz/bun-express-auth-template)
