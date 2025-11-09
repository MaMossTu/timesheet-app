#!/bin/bash

# Build script for Vercel deployment
echo "Running Vercel build script..."

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Create database and run migrations (for SQLite)
if [ ! -f "prisma/dev.db" ]; then
  echo "Creating database and running migrations..."
  npx prisma db push
else
  echo "Database exists, skipping migration"
fi

# Build Next.js
echo "Building Next.js application..."
next build