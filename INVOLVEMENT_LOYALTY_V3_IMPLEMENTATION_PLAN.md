# Involvement & Loyalty Model v3 - Implementation Plan

**Based on:** `INVOLVEMENT_MODEL_v3_SOCIOGRAM.md`  
**Current State:** Fully functional Deer River application (Job #137)  
**Target:** Advanced relationship modeling with network visualization

## 🎯 Overview

This plan implements the **Involvement & Loyalty Model v3** as specified in the new document, adding advanced relationship modeling, scoring algorithms, and Sigma.js network visualization to the existing Deer River application.

## 📋 Implementation Phases

### **Phase 1: Database Schema Extension** 
*Estimated Time: 2-3 hours*

#### 1.1 New Tables
- `household` - Domicile/room management
- `workplace` - Employment/role-based organizations  
- `relationship` - Generalized edge table for all relationship types
- `involvement_score` - Civic activity scoring (0.0-1.0)
- `loyalty_score` - Faction/person alignment scoring (0.0-1.0)
- `event` - Historical/ongoing events that impact scores

#### 1.2 Schema Updates
- Add new relationship types enum
- Extend existing tables with new fields
- Create foreign key relationships
- Add indexes for performance

#### 1.3 Migration Strategy
- Use Prisma migrations for schema changes
- Preserve existing data integrity
- Test migration on development database first

### **Phase 2: Core Scoring Logic**
*Estimated Time: 4-5 hours*

#### 2.1 Involvement Scoring Algorithm
```typescript
I = 0.35*RA + 0.25*EP + 0.20*NC + 0.10*IN + 0.10*RE
```
- **Role Activity (RA)** - Recurring duties (guard shifts, shopkeeping)
- **Event Participation (EP)** - Attendance & initiative in events
- **Network Centrality (NC)** - Graph-based centrality percentile
- **Initiative (IN)** - Number & impact of initiated actions
- **Reliability (RE)** - Completion rate for assigned tasks

#### 2.2 Loyalty Scoring Algorithm
```typescript
L(target) = 0.25*IF + 0.25*BF + 0.20*SH + 0.15*PC + 0.15*SA
```
- **Identity Fit (IF)** - Kinship/household overlap
- **Benefit Flow (BF)** - Material/social benefits
- **Shared History (SH)** - Past cooperation length/depth
- **Pressure/Cost (PC)** - Penalties if defecting
- **Satisfaction (SA)** - Sentiment of recent interactions

#### 2.3 Implementation Details
- Create scoring service classes
- Implement rolling window calculations
- Add exponential decay for older activity
- Create score breakdown tracking

### **Phase 3: API Endpoints**
*Estimated Time: 3-4 hours*

#### 3.1 New Endpoints
- `GET /api/graph` - Nodes and edges for network visualization
- `GET /api/person/:id/scores` - Full profile with involvement/loyalty scores
- `POST /api/event` - Create event and trigger recalculation
- `POST /api/scores/recompute` - Recompute all scores (async)
- `PUT /api/layout/positions` - Persist user-tuned node positions

#### 3.2 Enhanced Endpoints
- Extend existing people/factions/locations APIs
- Add relationship data to responses
- Include scoring information in person profiles

### **Phase 4: Network Visualization (Sigma.js)**
*Estimated Time: 5-6 hours*

#### 4.1 Dependencies
```bash
npm i graphology sigma graphology-layout-forceatlas2
npm i graphology-utils graphology-metrics
npm i zustand lodash
```

#### 4.2 Core Components
- `Sociogram.tsx` - Main network visualization component
- `SociogramControls.tsx` - Filters and search controls
- `NodeDetails.tsx` - Side panel for node information
- `GraphBuilder.ts` - Graph construction and layout logic

#### 4.3 Visual Features
- **Node Types**: Person, Faction, Household, Workplace
- **Edge Types**: Kinship, Work, Faction, Patronage, Friendship, Rivalry
- **Visual Encoding**: Size = involvement, Color = kind, Thickness = weight
- **Loyalty Rings**: Outer ring segments for top-3 loyalty targets

#### 4.4 Interactions
- Hover highlighting of ego networks
- Click to open detailed side panel
- Shift+click for multi-selection
- Search and filtering capabilities

### **Phase 5: UI Integration**
*Estimated Time: 2-3 hours*

#### 5.1 New Pages
- `/relationships` - Main sociogram page
- `/involvement` - Involvement scoring dashboard
- `/loyalty` - Loyalty analysis page
- `/events` - Event management interface

#### 5.2 Navigation Updates
- Add new menu items to main navigation
- Create breadcrumb integration
- Update routing configuration

#### 5.3 Data Integration
- Connect existing people/factions data
- Integrate with current demographics
- Maintain backward compatibility

## 🗄️ Database Schema Design

### **New Tables**

```sql
-- Households
CREATE TABLE household (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workplaces  
CREATE TABLE workplace (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT, -- shop, mill, marina, tavern, guard-post, caravan
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationship Types
CREATE TYPE relationship_kind AS ENUM (
  'kinship','household','work','faction','patronage',
  'friendship','rivalry','command','merchant','event-impact'
);

-- Generalized Relationships
CREATE TABLE relationship (
  id UUID PRIMARY KEY,
  src_id UUID NOT NULL,
  dst_id UUID NOT NULL,
  kind relationship_kind NOT NULL,
  directed BOOLEAN DEFAULT FALSE,
  weight REAL CHECK (weight >= 0 AND weight <= 1) DEFAULT 0.5,
  sentiment REAL CHECK (sentiment >= -1 AND sentiment <= 1) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Involvement Scores
CREATE TABLE involvement_score (
  person_id UUID PRIMARY KEY REFERENCES person(id) ON DELETE CASCADE,
  score REAL CHECK (score >= 0 AND score <= 1) NOT NULL,
  window TEXT DEFAULT '90d',
  breakdown JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty Scores
CREATE TABLE loyalty_score (
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  score REAL CHECK (score >= 0 AND score <= 1) NOT NULL,
  window TEXT DEFAULT '180d',
  breakdown JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (person_id, target_id)
);

-- Events
CREATE TABLE event (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT, -- festival, raid, policy, disaster, market
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  impact JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);
```

## 🎨 Visual Design Specifications

### **Color Palette**
- **Person**: `#4b7bec` (blue)
- **Faction**: `#e67e22` (orange)  
- **Household**: `#16a085` (teal)
- **Workplace**: `#8e44ad` (purple)

### **Edge Styling**
- **Kinship**: Solid lines
- **Work**: Dashed lines
- **Faction**: Dotted lines
- **Rivalry**: Red hue
- **Friendship**: Green hue
- **Command**: Arrowheads

### **Node Sizing**
- **Size Range**: 4px - 18px
- **Formula**: `size = 4 + (involvement * 14)`
- **Loyalty Rings**: Outer ring segments for top-3 targets

## 🔧 Technical Implementation

### **TypeScript Types**
```typescript
export type NodeKind = 'person' | 'faction' | 'household' | 'workplace';
export type EdgeKind = 'kinship'|'household'|'work'|'faction'|'patronage'|'friendship'|'rivalry'|'command'|'merchant'|'event-impact';

export interface NodeAttrs {
  key: string;
  kind: NodeKind;
  label: string;
  involvement?: number;
  loyalty?: Record<string, number>;
  tags?: string[];
  x?: number; y?: number; size?: number; color?: string;
}

export interface EdgeAttrs {
  key: string;
  source: string;
  target: string;
  kind: EdgeKind;
  weight?: number;
  sentiment?: number;
  directed?: boolean;
}
```

### **Graph Construction**
- Use Graphology for graph data structure
- ForceAtlas2 for initial layout
- Persist positions to database
- Support user customization

### **Performance Considerations**
- Materialized views for centrality calculations
- Caching for frequently accessed scores
- Lazy loading for large networks
- Debounced search and filtering

## 📊 Data Migration Strategy

### **Existing Data Integration**
1. **People** → Extend with household/workplace relationships
2. **Factions** → Convert to new relationship model
3. **Locations** → Map to households/workplaces
4. **Memberships** → Convert to relationship edges

### **Initial Scoring**
1. **Involvement**: Calculate from existing activity data
2. **Loyalty**: Derive from faction memberships
3. **Relationships**: Infer from co-residence and co-work
4. **Events**: Create initial events from existing data

## 🧪 Testing Strategy

### **Unit Tests**
- Scoring algorithm accuracy
- Graph construction logic
- API endpoint responses
- Data transformation functions

### **Integration Tests**
- End-to-end scoring pipeline
- Network visualization rendering
- User interaction flows
- Performance benchmarks

### **Data Validation**
- Score range validation (0.0-1.0)
- Relationship weight validation
- Graph connectivity checks
- Data consistency verification

## 🚀 Deployment Plan

### **Development Phase**
1. Create feature branch: `feature/involvement-loyalty-v3`
2. Implement schema changes
3. Develop core logic and APIs
4. Build visualization components
5. Integrate with existing UI

### **Testing Phase**
1. Comprehensive testing on development branch
2. Performance optimization
3. User experience refinement
4. Data validation and cleanup

### **Production Deployment**
1. Database migration with backup
2. Gradual rollout with feature flags
3. Monitor performance and errors
4. User training and documentation

## 📈 Success Metrics

### **Technical Metrics**
- Page load times < 2 seconds
- Network visualization renders < 1 second
- Score calculation accuracy > 99%
- Zero data loss during migration

### **User Experience Metrics**
- Intuitive navigation and interaction
- Clear visual encoding of relationships
- Responsive design across devices
- Comprehensive filtering and search

### **Business Value**
- Enhanced relationship analysis capabilities
- Improved faction and loyalty insights
- Better understanding of social dynamics
- Foundation for advanced analytics

## 🎯 Next Steps

1. **Review and approve** this implementation plan
2. **Create feature branch** for development
3. **Begin Phase 1** with database schema extension
4. **Iterative development** with regular testing
5. **User feedback integration** throughout development

This plan provides a comprehensive roadmap for implementing the Involvement & Loyalty Model v3 while maintaining the stability and functionality of the existing Deer River application.
