# 🚀 Deer River Development Workflow

## Overview
This document outlines the development workflow for the Deer River application, including branch management, deployment processes, and AWS integration.

## Branch Strategy

### Main Branches
- **`main`** - Production branch, automatically deploys to AWS Amplify
- **`development`** - Development branch for feature work and testing

### Workflow
1. **Feature Development**: Create feature branches from `development`
2. **Testing**: Merge feature branches into `development` for testing
3. **Production**: Merge `development` into `main` for production deployment

## AWS Setup Status ✅

### AWS CLI Configuration
- **Version**: aws-cli/2.30.4
- **Region**: us-east-1
- **Access**: Configured and working
- **Amplify App ID**: d25mi5h1ems0sj

### Amplify Configuration
- **App Name**: deer-river-app
- **Repository**: https://github.com/messiahcarey/deer-river-app
- **Domain**: d25mi5h1ems0sj.amplifyapp.com
- **Auto-deploy**: Disabled (manual deployments)

### Environment Variables
```
DATABASE_URL=postgresql://postgres:S4t4nH4ll2874!@database-1.chdfwf16ku5o.us-east-1.rds.amazonaws.com:5432/postgres
NEXTAUTH_SECRET=S4t4nH4ll2874!
NEXTAUTH_URL=database-1.chdfwf16ku5o.us-east-1.rds.amazonaws.com
```

## Git Configuration ✅

### User Setup
- **Name**: Shane Hall
- **Email**: shanehall42@gmail.com
- **Remote**: https://github.com/messiahcarey/deer-river-app.git

## Development Commands

### Local Development
```bash
# Start local development server
npm run dev

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed
```

### AWS Operations
```bash
# Check Amplify app status
aws amplify list-apps

# Start a new build
aws amplify start-job --app-id d25mi5h1ems0sj --branch-name main --job-type RELEASE

# Check build status
aws amplify list-jobs --app-id d25mi5h1ems0sj --branch-name main --max-results 1

# Get build details
aws amplify get-job --app-id d25mi5h1ems0sj --branch-name main --job-id [JOB_ID]
```

### Git Workflow
```bash
# Create feature branch
git checkout development
git checkout -b feature/your-feature-name

# Work on feature, commit changes
git add .
git commit -m "Add your feature"

# Push feature branch
git push -u origin feature/your-feature-name

# Merge to development (after testing)
git checkout development
git merge feature/your-feature-name
git push origin development

# Deploy to production
git checkout main
git merge development
git push origin main
```

## Build Configuration

### Amplify Build Spec
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - npm install
        - echo "Generating Prisma client..."
        - npx prisma generate
    build:
      commands:
        - echo "Building application..."
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

## Database Management

### Production Database
- **Type**: PostgreSQL (AWS RDS)
- **Endpoint**: database-1.chdfwf16ku5o.us-east-1.rds.amazonaws.com
- **Port**: 5432
- **Database**: postgres

### Local Development
- **Type**: SQLite
- **File**: ./prisma/dev.db
- **Schema**: schema.local.prisma

### Migration Commands
```bash
# Create new migration
npx prisma migrate dev --name your-migration-name

# Deploy to production
npx prisma migrate deploy

# Reset local database
npx prisma migrate reset
```

## Monitoring and Debugging

### Build Logs
- Access build logs through AWS Amplify Console
- Use AWS CLI to get build details and log URLs

### Application Logs
- Check CloudWatch logs for runtime errors
- Monitor database performance in RDS console

### Common Issues
1. **Build Failures**: Check build logs for dependency or compilation errors
2. **Database Connection**: Verify DATABASE_URL environment variable
3. **Prisma Issues**: Ensure Prisma client is generated before build

## Security Notes

### Environment Variables
- Never commit sensitive data to Git
- Use AWS Amplify environment variables for production secrets
- Keep local .env files in .gitignore

### Database Access
- Production database is secured with VPC and security groups
- Use connection pooling for production workloads
- Regular security updates for dependencies

## Next Steps

1. **Test Current Deployment**: Verify faction creation works in production
2. **Feature Development**: Use development branch for new features
3. **CI/CD Enhancement**: Consider enabling auto-deploy for development branch
4. **Monitoring Setup**: Configure CloudWatch alarms for production monitoring

## Useful Links

- **AWS Amplify Console**: https://console.aws.amazon.com/amplify/
- **GitHub Repository**: https://github.com/messiahcarey/deer-river-app
- **Production App**: https://d25mi5h1ems0sj.amplifyapp.com
- **Prisma Documentation**: https://www.prisma.io/docs/
- **Next.js Documentation**: https://nextjs.org/docs
