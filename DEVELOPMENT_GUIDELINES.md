# Development Guidelines for Data Persistence

## 🛡️ Preventing Data Persistence Issues

### 1. Always Validate Data Before Saving
```typescript
// ✅ Good: Validate before API call
const validation = usePersonValidation(personData)
if (!validation.isValid) {
  setError(validation.errors.join(', '))
  return
}

// ❌ Bad: Save without validation
await savePerson(personData)
```

### 2. Always Refresh Data After Saves
```typescript
// ✅ Good: Refresh after successful save
const response = await savePerson(data)
if (response.success) {
  await fetchPeople() // Refresh the list
}

// ❌ Bad: Assume save worked without refresh
await savePerson(data)
```

### 3. Use API Response Validation
```typescript
// ✅ Good: Validate API response
const validation = validatePersonResponse(response)
if (!validation.isValid) {
  throw new Error(`API validation failed: ${validation.errors.join(', ')}`)
}

// ❌ Bad: Trust API response blindly
const person = response.data
```

### 4. Add Data Consistency Checks
```typescript
// ✅ Good: Check data consistency
const { isConsistent, issues } = checkDataConsistency(people)
if (!isConsistent) {
  console.warn('Data consistency issues:', issues)
}
```

### 5. Implement Auto-Refresh
```typescript
// ✅ Good: Auto-refresh on focus/visibility
useAutoRefresh({
  refreshFunction: fetchPeople,
  onError: (error) => console.error('Auto-refresh failed:', error)
})
```

## 🧪 Testing Requirements

### Before Making Changes:
1. **Run existing tests**: `npm test`
2. **Check data consistency**: Look for console warnings
3. **Test the specific feature**: Edit a person, save, refresh page

### After Making Changes:
1. **Test data persistence**: Make changes, save, refresh, verify
2. **Test edge cases**: Empty fields, invalid data, network errors
3. **Run integration tests**: `npm run test:integration`

## 🚨 Common Pitfalls to Avoid

### 1. Not Refreshing Data After Saves
```typescript
// ❌ This will cause stale data
await savePerson(data)
// Missing: await fetchPeople()
```

### 2. Not Handling API Errors
```typescript
// ❌ This will cause silent failures
const response = await fetch('/api/people')
const data = await response.json()
setPeople(data.data) // What if data.success is false?
```

### 3. Not Validating Form Data
```typescript
// ❌ This will cause invalid data to be saved
const age = parseInt(formData.age) // What if formData.age is "abc"?
```

### 4. Not Checking Data Consistency
```typescript
// ❌ This will cause UI issues
people.map(person => (
  <div key={person.id}>{person.name}</div> // What if person.name is null?
))
```

## 🔧 Debugging Data Issues

### 1. Enable Console Logging
```typescript
console.log('Saving person with data:', updatedPerson)
console.log('API response:', response)
console.log('Refreshed data:', people)
```

### 2. Check Network Tab
- Look for failed API calls
- Check response status codes
- Verify request/response payloads

### 3. Use Data Consistency Checks
```typescript
import { logDataConsistency } from '@/utils/dataConsistency'
logDataConsistency(people) // Will log any issues
```

### 4. Test with Different Data
- Empty fields
- Special characters
- Very long strings
- Invalid numbers

## 📋 Checklist for Data Changes

- [ ] Added validation before save
- [ ] Added API response validation
- [ ] Added data refresh after save
- [ ] Added error handling
- [ ] Added console logging for debugging
- [ ] Tested with various data types
- [ ] Tested error scenarios
- [ ] Verified data consistency
- [ ] Updated tests if needed

## 🎯 Best Practices

1. **Always validate data** before sending to API
2. **Always refresh data** after successful saves
3. **Always handle errors** gracefully
4. **Always log important operations** for debugging
5. **Always test edge cases** and error scenarios
6. **Always check data consistency** after operations
7. **Always use TypeScript** for type safety
8. **Always write tests** for critical functionality
