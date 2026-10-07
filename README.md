# Kebu RMS Backend

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **MongoDB** (running locally or a remote connection string)

## Getting Started

### 1. Installation

Clone the repository (if you haven't already) and install the project dependencies:

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and copy the contents from `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and update the values with your local configuration (e.g., `MONGO_URI`, `JWT_SECRET`).

### Role and Permission seed

Populate the database with initial SYSTME ROlE and PERMISSIONS :

```bash
npm run seed
```

### 3. Available Scripts

Run these scripts from the project root using npm:

#### Development Mode

Starts the server with automatic file reloading whenever you make code changes:

```bash
npm run dev
```

#### Build Project

Compiles the TypeScript code into production-ready JavaScript inside the `dist/` directory:

```bash
npm run build
```

#### Production Mode

Starts the compiled application (make sure to run the build script first):

```bash
npm run start
```

#### Database Tools & Migrations

Run your custom CLI tool scripts for migrations or backups:

```bash
# Run the migration CLI tool
npm run script -- --help
```

#### API Test Data

Populate the database with sample categories, and menu items without
running the role and permission seed:

```bash
npm run seed:test
```

This command uses the `MONGO_URI` from `.env`. It can be run repeatedly to
update the same namespaced test records.

## API Health Check

Once the server is running (default port is usually `5000`), verify everything works by hitting the health-check endpoint:

```text
GET http://localhost:5000/api/v1/test
```

```json
{
  "message": "API up and running"
}
```
