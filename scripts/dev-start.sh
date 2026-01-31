#!/bin/bash
set -e

echo "🚀 Starting StageFinder in Development Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start only the database
echo "📦 Starting PostgreSQL database..."
docker compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker compose exec -T postgres pg_isready -U stagefinder -d stagefinder > /dev/null 2>&1; do
    sleep 1
done
echo "✅ Database is ready!"

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "📊 Pushing schema to database..."
npx prisma db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "🗄️  Database: localhost:5433"
echo ""
echo "Starting Next.js development server..."
echo ""

# Start Next.js dev server
npm run dev
