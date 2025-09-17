# 🚀 AWS Deployment Guide for Deer River

## Step-by-Step AWS Setup

### 1. Prerequisites Setup

#### Install AWS CLI
```bash
# Download and install AWS CLI from:
# https://aws.amazon.com/cli/
```

#### Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter default output format (json)
```

### 2. Create AWS RDS Database

#### Option A: Using AWS Console
1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Click "Create database"
3. Choose "PostgreSQL"
4. Select "Free tier" template
5. Set database identifier: `deerriver-db`
6. Set master username: `postgres`
7. Set master password: `[create a strong password]`
8. Click "Create database"
9. Wait for database to be available
10. Note the endpoint URL

#### Option B: Using AWS CLI
```bash
aws rds create-db-instance \
  --db-instance-identifier deerriver-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password "YourStrongPassword123!" \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default
```

### 3. Update Database Schema for PostgreSQL

Update your `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Create a new repository: `deer-river-app`
3. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/deer-river-app.git
git push -u origin main
```

### 5. Deploy to AWS Amplify

#### Option A: Using AWS Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Choose "GitHub" as source
4. Connect your GitHub account
5. Select repository: `deer-river-app`
6. Select branch: `main`
7. Set build settings:
   - Build command: `npm run build`
   - Base directory: `deer-river-app`
   - Output directory: `.next`
8. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres:YourPassword@your-rds-endpoint:5432/deerriver
   NEXTAUTH_SECRET=your-random-secret-key
   NEXTAUTH_URL=https://your-app.amplifyapp.com
   ```
9. Click "Save and deploy"

#### Option B: Using AWS CLI
```bash
aws amplify create-app \
  --name deer-river-app \
  --repository https://github.com/YOUR_USERNAME/deer-river-app \
  --access-token YOUR_GITHUB_TOKEN \
  --environment-variables DATABASE_URL=postgresql://postgres:YourPassword@your-rds-endpoint:5432/deerriver
```

### 6. Set Up CI/CD Pipeline

#### Add GitHub Secrets
1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add these secrets:
   ```
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   DATABASE_URL=postgresql://postgres:YourPassword@your-rds-endpoint:5432/deerriver
   NEXTAUTH_SECRET=your-random-secret-key
   NEXTAUTH_URL=https://your-app.amplifyapp.com
   ```

### 7. Run Database Migrations

Once deployed, run migrations:

```bash
# Connect to your deployed app
aws amplify start-job \
  --app-id your-app-id \
  --branch-name main \
  --job-type RELEASE

# Or run migrations manually
npx prisma migrate deploy
npx prisma generate
```

### 8. Test Your Deployment

1. Visit your Amplify app URL
2. Test all features:
   - People management
   - Faction system
   - Map functionality
   - Resource tracking
   - Event logging

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check RDS security groups
   - Verify DATABASE_URL format
   - Ensure database is publicly accessible (for testing)

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check build logs in Amplify console

3. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names and values
   - Restart the app after adding variables

### Useful Commands

```bash
# Check AWS CLI configuration
aws configure list

# List RDS instances
aws rds describe-db-instances

# List Amplify apps
aws amplify list-apps

# Check Amplify app details
aws amplify get-app --app-id your-app-id
```

## 📊 Monitoring

### CloudWatch Logs
- View application logs in CloudWatch
- Monitor database performance
- Set up alarms for errors

### Amplify Console
- Monitor build status
- View deployment history
- Check environment variables

## 🔄 Updates and Maintenance

### Making Changes
1. Make changes to your code
2. Commit and push to GitHub
3. Amplify automatically builds and deploys
4. Database migrations run automatically

### Database Updates
```bash
# Create new migration
npx prisma migrate dev --name your-migration-name

# Deploy migration
npx prisma migrate deploy
```

## 💰 Cost Estimation

### Free Tier (First 12 months)
- RDS: 750 hours of db.t3.micro
- Amplify: 1,000 build minutes/month
- Data transfer: 1GB/month

### After Free Tier
- RDS: ~$15-20/month
- Amplify: ~$1-5/month (depending on usage)
- Data transfer: $0.09/GB

## 🎉 Success!

Once deployed, your Deer River application will be available at:
`https://your-app-name.amplifyapp.com`

The application will automatically update whenever you push changes to your GitHub repository!
