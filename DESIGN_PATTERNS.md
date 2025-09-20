# Design Patterns for Deer River App

## Table Sorting Pattern

### Overview
All data tables in the Deer River app should implement consistent sorting functionality across all columns (except Actions column).

### Implementation Pattern

#### 1. State Management
```typescript
const [sortField, setSortField] = useState<keyof DataType | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
```

#### 2. Sort Handler
```typescript
const handleSort = (field: keyof DataType) => {
  if (sortField === field) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortField(field);
    setSortDirection('asc');
  }
};
```

#### 3. Sort Icon Function
```typescript
const getSortIcon = (field: keyof DataType) => {
  if (sortField !== field) return '↕️';
  return sortDirection === 'asc' ? '↑' : '↓';
};
```

#### 4. Sorting Logic
```typescript
const getSortedData = () => {
  if (!sortField) return data;

  return [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    // Handle nested objects
    if (sortField === 'nestedField' && typeof aValue === 'object' && aValue !== null) {
      aValue = (aValue as { name?: string }).name || '';
    }
    if (sortField === 'nestedField' && typeof bValue === 'object' && bValue !== null) {
      bValue = (bValue as { name?: string }).name || '';
    }

    // Handle arrays (e.g., memberships)
    if (sortField === 'memberships' && Array.isArray(aValue)) {
      const primaryItem = aValue.find((m: any) => m.isPrimary);
      aValue = primaryItem ? primaryItem.faction.name : (aValue.length > 0 ? aValue[0].faction.name : '');
    }
    if (sortField === 'memberships' && Array.isArray(bValue)) {
      const primaryItem = bValue.find((m: any) => m.isPrimary);
      bValue = primaryItem ? primaryItem.faction.name : (bValue.length > 0 ? bValue[0].faction.name : '');
    }

    // Handle special field transformations
    if (sortField === 'tags') {
      aValue = aValue === 'present' ? 'Present' : 'Absent';
      bValue = bValue === 'present' ? 'Present' : 'Absent';
    }

    // Convert to strings for comparison
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};
```

#### 5. Table Header Structure
```tsx
<th 
  className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
  onClick={() => handleSort('fieldName')}
>
  <div className="flex items-center gap-1">
    Column Name {getSortIcon('fieldName')}
  </div>
</th>
```

#### 6. Table Body
```tsx
<tbody className="divide-y divide-gray-200">
  {getSortedData().map((item) => (
    // Table rows
  ))}
</tbody>
```

### Styling Classes
- **Sortable header**: `cursor-pointer hover:bg-gray-100 select-none`
- **Sort icon container**: `flex items-center gap-1`
- **Table body**: `divide-y divide-gray-200`

### Special Cases

#### Nested Objects
For fields that contain objects with a `name` property, extract the name for sorting:
```typescript
if (sortField === 'location' && typeof aValue === 'object' && aValue !== null) {
  aValue = (aValue as { name?: string }).name || '';
}
```

#### Arrays
For fields that are arrays (like memberships), sort by the primary item or first item:
```typescript
if (sortField === 'memberships' && Array.isArray(aValue)) {
  const primaryItem = aValue.find((m: any) => m.isPrimary);
  aValue = primaryItem ? primaryItem.faction.name : (aValue.length > 0 ? aValue[0].faction.name : '');
}
```

#### Status Fields
For boolean or enum fields that need display text conversion:
```typescript
if (sortField === 'tags') {
  aValue = aValue === 'present' ? 'Present' : 'Absent';
  bValue = bValue === 'present' ? 'Present' : 'Absent';
}
```

### Usage Guidelines
1. **All columns should be sortable** except Actions column
2. **Consistent visual feedback** with hover states and sort icons
3. **Handle edge cases** like null values, nested objects, and arrays
4. **Maintain accessibility** with proper cursor and select-none classes
5. **Use this pattern** for all future table implementations

### Example Implementation
See `src/app/people/page.tsx` for a complete implementation of this pattern.

## Faction Display Pattern

### Overview
When displaying faction memberships in tables, show all active memberships with proper visual indicators and primary status.

### Implementation Pattern

#### 1. Data Structure
```typescript
interface Person {
  memberships?: {
    id: string;
    faction: {
      id: string;
      name: string;
      color: string | null;
    };
    role: string;
    isPrimary: boolean;
  }[];
}
```

#### 2. Display Logic
```tsx
{person.memberships && person.memberships.length > 0 ? (
  <div className="space-y-1">
    {person.memberships.map((membership) => (
      <div key={membership.id} className="flex items-center gap-2">
        <span 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: membership.faction.color || '#6b7280' }}
        ></span>
        <span className="text-sm">
          {membership.faction.name}
          {membership.isPrimary && (
            <span className="ml-1 text-xs text-gray-500">(Primary)</span>
          )}
        </span>
      </div>
    ))}
  </div>
) : (
  <span className="text-gray-400 text-sm">No faction</span>
)}
```

#### 3. Visual Design
- **Color indicators**: Small colored dots matching faction colors
- **Primary status**: "(Primary)" label for main faction
- **Multiple factions**: Stacked vertically with spacing
- **No faction state**: Gray "No faction" text
- **Consistent spacing**: `space-y-1` for vertical spacing

#### 4. Key Features
- **Shows all memberships**: Displays every active faction membership
- **Primary indication**: Clear visual indicator for primary faction
- **Color coding**: Faction colors for quick identification
- **Handles empty state**: Graceful fallback when no factions
- **No duplicates**: Each membership shown exactly once

### Usage Guidelines
1. **Always show all memberships** - don't hide secondary factions
2. **Use color indicators** - helps with quick visual identification
3. **Mark primary clearly** - users need to know which is main faction
4. **Handle empty state** - provide clear feedback when no factions
5. **Consistent styling** - use same pattern across all faction displays

### Example Implementation
See `src/app/people/page.tsx` for a complete implementation of this pattern.
