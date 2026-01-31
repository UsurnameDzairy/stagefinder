#!/bin/bash

# Setup script for StageFinder
set -x  # Print commands as they execute

echo "🚀 Starting StageFinder setup..."

# Set Node.js path
export PATH="$HOME/.nvm/versions/node/v24.13.0/bin:$PATH"

# Verify Node.js
echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Skip cleaning .next - causes issues
echo "⏭️  Skipping .next cleanup..."

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate || echo "Prisma generate failed, continuing..."

# Push database schema
echo "💾 Syncing database schema..."
npx prisma db push --skip-generate || echo "Prisma db push failed, continuing..."

# Start development server
echo "✅ Setup complete! Starting development server..."
npm run dev
