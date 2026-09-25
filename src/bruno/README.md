# Bruno API Collections

This folder stores Bruno API test collections.

## Structure Demo

```text
src/bruno/
  README.md
  healthCheck/
  auth/
    bruno.json
    login.bru
    register.bru
    environments/
      development.bru
  users/
    bruno.json
    get-profile.bru
    environments/
      development.bru
      .
      .
      .
      .
```

## Rules

- One folder = one Bruno collection
- Each collection must have its own `bruno.json`
- Keep one environment file per collection, named `development.bru`
- Request files should be named by action or endpoint, for example `login.bru`, `get-profile.bru`
- Reuse environment variables like `baseUrl`, `userEmail`

## Run a collection

```bash
cd src/bruno/auth
bru run --env development

or
npm run test:api:auth

```

```bash
cd src/bruno/users
bru run --env development
```

## Add a new collection

1. Create a new folder under `src/bruno/`
2. Add `bruno.json`
3. Add an `environments/development.bru` file
4. Add request files for each endpoint
5. Update `package.json` scripts if needed

   e.g.
   "test:api:<collection_name>": "cd src/bruno/<collection_Folder_Name> && bru run --env development"

   ## Run a collection

        ```bash
            npm run test:api:<collection_name>
        ```
