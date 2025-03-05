#!/bin/sh

# Run database migration only if necessary
echo "Running database migrations..."
npm run migrate

# Start the application with nodemon
echo "Starting application with nodemon..."
nodemon src/server.ts
