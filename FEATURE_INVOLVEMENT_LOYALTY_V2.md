# Involvement & Loyalty Model v2 - Feature Branch

**Branch**: `feature/involvement-loyalty-v2`  
**Base**: `ui-ux-stable-v1` (commit `24e796d`)  
**Created**: October 12, 2025

## 🎯 Feature Overview

This feature implements a sophisticated involvement and loyalty system with:
- **Cohort-based seeding** for fast, reproducible generation
- **Per-pair overrides** for precise subgroups
- **Events system** that modifies scores with full provenance
- **Deterministic RNG** for reproducible results

## 📋 Implementation Plan

### Phase 1: Database Schema
- [ ] Create `cohort` table
- [ ] Create `person_cohort` junction table
- [ ] Create `seeding_policy` table
- [ ] Extend `person_relation` with provenance fields
- [ ] Create `person_relation_override` table
- [ ] Create `event` and `event_effect` tables
- [ ] Create `person_relation_audit` table (optional)

### Phase 2: Core Logic
- [ ] Implement seeding algorithm with deterministic RNG
- [ ] Implement effective score calculation
- [ ] Implement events system (add/multiply/decay)
- [ ] Add score clamping and validation

### Phase 3: API Endpoints
- [ ] `POST /api/seed/relations` (with dryRun + worldSeed)
- [ ] `POST /api/overrides/upsert`
- [ ] `POST /api/events` and `POST /api/events/:id/effects`
- [ ] `GET /api/relations/effective?personId=X&domain=...`
- [ ] `POST /api/events/:id/commit`

### Phase 4: UI Components
- [ ] Cohorts manager
- [ ] Seeding console (preview → apply)
- [ ] Overrides editor
- [ ] Events panel
- [ ] Enhanced person relationships view

### Phase 5: Testing & Integration
- [ ] Unit tests for seeding logic
- [ ] Integration tests for API endpoints
- [ ] UI testing for new components
- [ ] Performance testing with large datasets

## 🚨 Risk Mitigation

### Database Safety
- **Backup Required**: This involves major schema changes
- **Migration Strategy**: Use Prisma migrations with rollback plan
- **Testing**: Test on development database first

### Complexity Management
- **Incremental Development**: Implement one phase at a time
- **Feature Flags**: Use feature flags to enable/disable new functionality
- **Rollback Plan**: Keep ability to revert to stable state

### Performance Considerations
- **Indexing**: Proper database indexes
- **Caching**: Cache effective scores for 5-15 minutes
- **Density Control**: Limit relations per person (k ≤ 20)

## 🔄 Development Workflow

1. **Start with Phase 1**: Database schema changes
2. **Test Each Phase**: Ensure stability before moving to next
3. **Regular Commits**: Commit working code frequently
4. **Documentation**: Update this file as we progress
5. **Testing**: Test thoroughly before merging

## 📊 Success Criteria

- [ ] All database tables created and migrated
- [ ] Seeding system works with deterministic results
- [ ] Events system modifies scores correctly
- [ ] UI allows management of all new features
- [ ] Performance remains acceptable
- [ ] No data loss during migration

## 🛠️ Technical Notes

### Key Dependencies
- **Prisma**: For database schema management
- **seedrandom**: For deterministic random number generation
- **React**: For UI components
- **TypeScript**: For type safety

### Database Considerations
- **Provenance Tracking**: All changes tracked with source
- **Audit Trail**: Optional audit table for compliance
- **Performance**: Proper indexing for fast queries

---

**Note**: This is a complex feature that will require careful planning and testing. We'll implement it incrementally to maintain system stability.
