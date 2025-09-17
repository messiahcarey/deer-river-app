const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up local development environment...');

// Copy local schema to main schema
const localSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.local.prisma');
const mainSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (fs.existsSync(localSchemaPath)) {
  fs.copyFileSync(localSchemaPath, mainSchemaPath);
  console.log('✓ Switched to local SQLite schema');
} else {
  console.log('⚠ Local schema not found, using production schema');
}

// Generate Prisma client
console.log('Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

// Run migrations
console.log('Running database migrations...');
execSync('npx prisma migrate dev --name local-init', { stdio: 'inherit' });

// Start development server
console.log('Starting development server...');
execSync('npm run dev', { stdio: 'inherit' });
