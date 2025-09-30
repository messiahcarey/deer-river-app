# Development Workflow

## Branch Structure

- **`main`** - Production branch (deployed to AWS Amplify)
- **`development`** - Development branch for experimental features and major changes

## Development Process

### 1. Working on Features
```bash
# Make sure you're on development branch
git checkout development

# Pull latest changes
git pull origin development

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes, commit frequently
git add .
git commit -m "Add feature X"

# Push feature branch
git push origin feature/your-feature-name
```

### 2. Merging to Development
```bash
# Switch to development
git checkout development

# Merge feature branch
git merge feature/your-feature-name

# Push to development
git push origin development
```

### 3. Deploying to Production
```bash
# Switch to main
git checkout main

# Merge development
git merge development

# Push to main (triggers Amplify deployment)
git push origin main
```

## Current Development Focus

### Multi-Faction Assignment System
- **Goal**: Allow people to be assigned to multiple factions
- **Current Status**: Basic single-faction assignment working
- **Next Steps**: 
  - Update PersonEditModal to support multiple faction selection
  - Implement checkbox-based faction selection UI
  - Add primary/secondary faction distinction
  - Update display logic for multiple factions

### Planned Features
- [ ] Multi-faction assignment UI
- [ ] Enhanced faction display on People page
- [ ] Faction relationship management
- [ ] Bulk faction operations
- [ ] Faction analytics and reporting

## Testing

- **Local Development**: Use `npm run dev` for local testing
- **Database**: Use `/api/db-status` endpoint to check database state
- **Development**: Changes to `development` branch auto-deploy to Amplify
  - **URL**: `https://development.d25mi5h1ems0sj.amplifyapp.com`
  - **Status**: Check AWS Amplify console for build status
- **Production**: Changes to `main` branch auto-deploy to Amplify
  - **URL**: `https://d25mi5h1ems0sj.amplifyapp.com`

## Notes

- Always test changes on development branch first
- Use descriptive commit messages
- Keep feature branches focused on single features
- Merge to main only when features are complete and tested
