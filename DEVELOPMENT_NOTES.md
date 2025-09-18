# Deer River Development Notes

## 🚨 CRITICAL REMINDERS

### **Deployment Strategy**
- **We use AWS Amplify for deployment** - NOT local development
- **No local database migrations** - Changes go directly to production via Amplify
- **Always test via Amplify deployment** - Local `npm run dev` is not the primary workflow
- **Database is PostgreSQL in production** - Not SQLite locally

### **Workflow**
1. Make code changes
2. Commit and push to `main` branch
3. Amplify automatically deploys
4. Test on live Amplify URL
5. Check Amplify logs if issues arise

### **Database Changes**
- Update `prisma/schema.prisma` (PostgreSQL version)
- Push changes to trigger Amplify deployment
- Amplify will run migrations automatically
- **DO NOT** run `npx prisma migrate dev` locally

### **Environment**
- Production database: PostgreSQL via Amplify
- Local development: Limited (use for quick testing only)
- Primary testing: Amplify deployment

### **Current Status**
- Faction system: ✅ Complete and deployed
- People system: ✅ Complete and deployed  
- Locations system: ✅ Complete and deployed
- **Next: Faction relationships system** (PersonFactionMembership, FactionOpinion)

### **API Endpoints**
- `/api/people` - People CRUD
- `/api/factions` - Factions CRUD
- `/api/locations` - Locations CRUD
- **Next: `/api/memberships` and `/api/faction-opinions`**

### **Key Files**
- `prisma/schema.prisma` - Production database schema
- `src/app/api/` - API routes
- `src/app/people/page.tsx` - People management
- `src/app/factions/page.tsx` - Factions management
- `src/components/` - UI components

---
*Last updated: When adding faction relationship system*
