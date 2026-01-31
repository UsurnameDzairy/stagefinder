#!/bin/bash

# Set PATH to include Node.js
export PATH="/Users/userdz/.nvm/versions/node/v24.13.0/bin:$PATH"

echo "Installing Prisma..."
npm install prisma@latest @prisma/client@latest

echo "Generating Prisma client..."
npx prisma generate

echo "Syncing database..."
npx prisma db push

echo "Starting server..."
npm run dev
