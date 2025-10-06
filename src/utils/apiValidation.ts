interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp?: string
}

export function validateApiResponse<T>(
  response: ApiResponse<T>,
  expectedFields: (keyof T)[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!response.success) {
    errors.push(`API call failed: ${response.error || 'Unknown error'}`)
    return { isValid: false, errors }
  }

  if (!response.data) {
    errors.push('API response missing data field')
    return { isValid: false, errors }
  }

  // Check that all expected fields are present
  expectedFields.forEach(field => {
    if (!(field in response.data)) {
      errors.push(`Missing required field: ${String(field)}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Specific validation for Person API responses
export function validatePersonResponse(response: any) {
  return validateApiResponse(response, [
    'id',
    'name',
    'species',
    'age',
    'memberships'
  ])
}

// Validation for People list API responses
export function validatePeopleListResponse(response: any) {
  if (!response.success || !Array.isArray(response.data)) {
    return { isValid: false, errors: ['Invalid people list response'] }
  }

  const errors: string[] = []
  response.data.forEach((person: any, index: number) => {
    const personValidation = validatePersonResponse({ success: true, data: person })
    if (!personValidation.isValid) {
      errors.push(`Person ${index}: ${personValidation.errors.join(', ')}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}
