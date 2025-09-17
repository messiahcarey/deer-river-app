#!/bin/bash
echo "Starting Deer River build process..."

echo "Installing dependencies..."
npm ci --legacy-peer-deps

echo "Generating Prisma client..."
npx prisma generate

echo "Building application..."
npm run build

echo "Build completed successfully!"
