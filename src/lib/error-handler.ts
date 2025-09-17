import { NextResponse } from 'next/server'
import { Logger } from './logger'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
  details?: unknown
}

export class AppError extends Error implements ApiError {
  statusCode: number
  code: string
  details?: unknown

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown, context: string = 'API'): NextResponse {
  Logger.error(`${context} error occurred`, error)

  if (error instanceof AppError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString()
    }, { 
      status: error.statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  if (error instanceof Error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  return NextResponse.json({
    success: false,
    error: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  }, { 
    status: 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

export function validateRequired(data: Record<string, unknown>, fields: string[]): void {
  const missing = fields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new AppError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      'VALIDATION_ERROR',
      { missingFields: missing }
    )
  }
}

export function validateDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL?.trim()
  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    throw new AppError(
      'Invalid or missing DATABASE_URL',
      500,
      'CONFIG_ERROR',
      { providedUrl: dbUrl ? 'Set but invalid format' : 'Not set' }
    )
  }
  return dbUrl
}
