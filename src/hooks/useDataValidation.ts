import { useEffect, useState } from 'react'

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function useDataValidation<T>(
  data: T,
  validationRules: Array<{
    field: keyof T
    validator: (value: any) => boolean
    errorMessage: string
  }>
): ValidationResult {
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    errors: []
  })

  useEffect(() => {
    const errors: string[] = []
    
    validationRules.forEach(rule => {
      const value = data[rule.field]
      if (!rule.validator(value)) {
        errors.push(rule.errorMessage)
      }
    })

    setResult({
      isValid: errors.length === 0,
      errors
    })
  }, [data, validationRules])

  return result
}

// Specific validation rules for Person data
export const personValidationRules = [
  {
    field: 'name' as const,
    validator: (value: any) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'Name is required'
  },
  {
    field: 'age' as const,
    validator: (value: any) => value === null || (typeof value === 'number' && value >= 0 && value <= 1000),
    errorMessage: 'Age must be a number between 0 and 1000'
  },
  {
    field: 'species' as const,
    validator: (value: any) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'Species is required'
  }
]

// Hook for validating person data before save
export function usePersonValidation(person: any) {
  return useDataValidation(person, personValidationRules)
}
