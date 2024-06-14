# divergent-test
Webapp/server built for Divergent 3D's developer coding exercise

# Dependencies
Node.js v20.9.0 or later
PostgreSQL v16.3 or later

# Running the project
## Client
In the `client` directory:

On initial setup:
```
npm install
```

To run the frontend:
```
npm run dev
```

## Server
In PostgreSQL, create a new database named `inventory`.
In the `server` directory:

Create a .env file with your Postgres user role username/password (see example in the `env_example` file).

On initial setup:
```
npm install
```

To run the backend:
```
npx nodemon start
```