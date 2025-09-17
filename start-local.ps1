Write-Host "Starting local development server..." -ForegroundColor Green
Write-Host "Setting DATABASE_URL to SQLite..." -ForegroundColor Yellow
$env:DATABASE_URL = "file:./dev.db"
Write-Host "Running database setup..." -ForegroundColor Yellow
npx prisma generate
npx prisma migrate dev --name local-init
Write-Host "Starting Next.js development server..." -ForegroundColor Green
npm run dev
