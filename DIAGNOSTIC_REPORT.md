# Deer River App - Comprehensive Diagnostic Report

## Project Overview
**Deer River** is a Next.js 15.1.3 fantasy town population management application inspired by AD&D 1e. It tracks citizens, factions, relationships, and resources in a fantasy settlement.

## Current Status
- **Local Development**: ✅ Working (with fixes)
- **Amplify Deployment**: ❌ Failed (ESLint error fixed, new deployment triggered)
- **Database**: ✅ PostgreSQL on AWS RDS (shared between dev/prod)

## Technical Stack

### Core Technologies
- **Framework**: Next.js 15.1.3 (App Router)
- **Language**: TypeScript 5.7.2
- **Database**: PostgreSQL with Prisma ORM 6.16.2
- **Styling**: Tailwind CSS 3.4.17
- **Deployment**: AWS Amplify
- **Node.js**: v22.19.0
- **Package Manager**: npm 10.9.3

### Key Dependencies
```json
{
  "dependencies": {
    "@prisma/client": "^6.16.2",
    "es-abstract": "^1.24.0",
    "next": "^15.1.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.2",
    "@testing-library/react": "^16.1.0",
    "eslint": "^9.17.0",
    "jest": "^29.7.0",
    "msw": "^2.11.3",
    "prisma": "^6.16.2",
    "typescript": "^5.7.2"
  }
}
```

## Database Schema (Prisma)

### Core Models
- **Person**: Citizens with species, age, occupation, faction memberships
- **Faction**: Political groups with colors, mottos, descriptions
- **Location**: Buildings and places (homes, workplaces)
- **Household**: Family units within locations
- **PersonFactionMembership**: Many-to-many with roles, alignment, openness
- **FactionOpinion**: Personal opinions about factions
- **Opinion**: Person-to-person relationships
- **ResourceCategory**: Economic resource types
- **TownResourceLedger**: Resource tracking
- **EventLog**: System events

### Key Relationships
- Person → LivesAt (Location)
- Person → WorksAt (Location)
- Person → Household
- Person ↔ Faction (via PersonFactionMembership)
- Person → FactionOpinion
- Person ↔ Person (via Opinion)

## API Architecture

### App Router API Routes (src/app/api/)
- `/api/dashboard` - Main dashboard metrics
- `/api/demographics` - Enhanced species-based demographics
- `/api/people` - Person CRUD operations
- `/api/factions` - Faction management
- `/api/locations` - Location management
- `/api/memberships` - Person-faction relationships
- `/api/health` - Health check endpoint
- Multiple debug/test endpoints

### Database Connection Pattern
All API routes use explicit Prisma client initialization:
```typescript
const dbUrl = process.env.DATABASE_URL?.trim()
if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
  return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 })
}

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
})
```

## Current Issues & Solutions

### 1. DemographicsCharts Component Error ✅ FIXED
**Problem**: `TypeError: Cannot read properties of undefined (reading 'species')`
**Root Cause**: Component expected old data structure but received new enhanced structure
**Solution**: Added backward compatibility with helper functions to handle both data structures

### 2. Amplify Deployment Failures
**Problem**: ESLint errors causing build failures
**Solution**: Fixed unused variable error (`_` → `,` in destructuring)

### 3. API Route 404 Issues (Historical)
**Problem**: Some API routes returned 404 on Amplify
**Solution**: Standardized Prisma client initialization across all routes

## Build Configuration

### TypeScript Config (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./src/*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "prisma/seed.ts", "prisma/simple-seed.ts"]
}
```

### Amplify Build Spec (amplify.yml)
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - npm install
        - echo "Skipping database schema update for now..."
        - echo "Generating Prisma client..."
        - npx prisma generate
    build:
      commands:
        - echo "Building application..."
        - npm run build
  artifacts:
    baseDirectory: .next
    files: ['**/*']
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

## Environment Configuration

### Local (.env.local)
```
DATABASE_URL="postgresql://postgres:NewSecurePassword123!@database-1.chdfwf16ku5o.us-east-1.rds.amazonaws.com:5432/postgres"
NEXTAUTH_SECRET="NewRandomSecretKey456!"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Amplify Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Production URL

## Recent Changes & Features

### Enhanced Demographics System
- Species-based demographic analysis with D&D age categories
- Comprehensive tabbed interface (Overview, Charts, Species, Age, Factions, Locations, Occupations)
- Species filtering and detailed breakdowns
- Integration of enhanced analysis into main demographics page

### UI Improvements
- Mobile-responsive design
- Breadcrumb navigation
- Interactive charts and visualizations
- Workflow templates for common tasks
- Enhanced dashboard with key metrics

### Database Enhancements
- Person-faction membership system with roles and alignment
- Faction opinion tracking
- Enhanced location management
- Resource ledger system

## Testing Infrastructure

### Test Frameworks
- **Jest**: Unit testing
- **Playwright**: E2E testing
- **React Testing Library**: Component testing
- **MSW**: API mocking

### Test Scripts
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:visual": "playwright test --grep @visual",
  "test:all": "npm run test && npm run test:e2e"
}
```

## Deployment Status

### Current Deployment (Job #62)
- **Status**: FAILED (BUILD step failed)
- **Commit**: f57c83d - "Fix DemographicsCharts component to handle new data structure and prevent species property errors"
- **Issue**: ESLint error (unused variable)
- **Fix Applied**: ✅ Committed and pushed

### Previous Successful Deployments
- Job #61: ✅ SUCCEEDED - Species name normalization fixes
- Job #60: ✅ SUCCEEDED - Enhanced demographics integration
- Job #59: ✅ SUCCEEDED - Build error fixes

## Key Files Structure

```
deer-river-app/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── demographics/  # Demographics page
│   │   ├── people/        # People management
│   │   ├── factions/      # Faction management
│   │   ├── map/           # Location management
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   └── lib/              # Utility libraries
├── prisma/
│   └── schema.prisma     # Database schema
├── amplify.yml           # Amplify build config
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## Next Steps for Another AI

1. **Monitor New Deployment**: Check if the ESLint fix resolved the build failure
2. **Test Demographics Page**: Verify the Charts tab works without species property errors
3. **API Route Testing**: Ensure all API endpoints are functioning on Amplify
4. **Database Verification**: Confirm data integrity after recent schema changes
5. **Performance Optimization**: Review build times and bundle sizes
6. **Test Coverage**: Implement missing API route tests

## Critical Notes

- **Database Shared**: Development and production share the same PostgreSQL database
- **No Local Database**: Local development connects to live AWS database
- **SWC Issues**: Windows-specific SWC binary issues resolved
- **API Route Pattern**: All routes use explicit DATABASE_URL configuration
- **Build Success**: Local builds pass, Amplify builds were failing on ESLint

## Contact Information
- **Repository**: https://github.com/messiahcarey/deer-river-app
- **Amplify App ID**: d25mi5h1ems0sj
- **Development URL**: https://development.d25mi5h1ems0sj.amplifyapp.com
- **Production URL**: https://d25mi5h1ems0sj.amplifyapp.com
