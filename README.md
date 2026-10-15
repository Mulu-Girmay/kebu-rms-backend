# Kebu RMS Backend

This repository contains the backend API for Kebu RMS. It provides the authentication, authorization, order, cart, menu, wallet, and notification flows used by the application.

## Prerequisites

Before starting the project, make sure you have:

- Node.js 18 or newer
- npm
- MongoDB running locally or a reachable MongoDB connection string
- A Gmail/Google account configured for the email and OAuth settings used by the app

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env
```

Then update `.env` with your local values. The application expects variables such as:

```env
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

MONGO_URI=mongodb://localhost:27017/kebu_rms_db

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h
EMAIL_VERIFICATION_EXPIRES_IN=30

EMAIL_FROM="Kebu RMS <noreply@kebu.com>"
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_google_app_password

OAUTH_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=your_google_client_secret
OAUTH_REFRESH_TOKEN=your_google_oauth_refresh_token
APP_CLIENT_URL=http://localhost:5173

SUPERADMIN_EMAIL=superAdmin@example.com
SUPERADMIN_PASSWORD=changePassword!
```

Notes:

- `MONGO_URI` must point to a running MongoDB instance.
- `JWT_SECRET` should be a strong secret in production.
- `EMAIL_*` and `OAUTH_*` values are required for verification and password-reset flows. If they are missing or incorrect, the server may still start but those features will not work as expected.
- `APP_CLIENT_URL` should match the frontend URL you are using locally, such as `http://localhost:5173`.

### 3. Start MongoDB

Make sure MongoDB is running before starting the API server.

### 4. Seed the database

Run the seed command to create the initial roles, permissions, and default super admin user:

```bash
npm run seed
```

This step is important for a fresh database. Without it, admin and protected routes may not work correctly.

### 5. Start the application

#### Development mode

```bash
npm run dev
```

This starts the server with TypeScript hot reloading enabled.

#### Production build

```bash
npm run build
npm run start
```

The API listens on the port defined by `PORT` (default: `5000`).

## Available Scripts

```bash
npm run dev
```

Starts the backend in development mode with hot reloading.

```bash
npm run build
```

Compiles the TypeScript project into the `dist/` folder.

```bash
npm run start
```

Runs the compiled production build.

```bash
npm run seed
```

Seeds roles, permissions, and the default super admin user.

```bash
npm run seed:admin
```

Seeds only the super admin user when roles and permissions already exist.

```bash
npm run seed:test
```

Loads example test data such as categories and menu items.

```bash
npm run lint
```

Runs ESLint across the project.

```bash
npm run typecheck
```

Runs a TypeScript check without generating build output.

## API Health Check

After the server is running, verify the API is reachable:

```text
GET http://localhost:5000/api/v1/test
```

Example response:

```json
{
  "message": "API up and running"
}
```

## Bruno API Tests

This project includes Bruno collections under `src/bruno` for API testing. Once the backend is running locally, you can run the checks with:

```bash
npm run test:api:health
npm run test:api:auth
npm run test:api:users
```

## Notes

- For a fresh database, always run `npm run seed` before signing in or using admin endpoints.
- Keep `APP_CLIENT_URL` aligned with the frontend URL used in development.
- If your email/OAuth configuration is incomplete, the server can still boot, but features like email verification and password resets will fail until those credentials are configured correctly.
