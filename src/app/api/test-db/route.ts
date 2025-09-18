import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    console.log('DATABASE_URL value:', process.env.DATABASE_URL)
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')))
    
    // Ensure the URL is set
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (!dbUrl) {
      throw new Error(`DATABASE_URL not set`)
    }
    
    // Create Prisma client with explicit environment variable
    const prismaWithEnv = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })
    
    // Test database connection
    await prismaWithEnv.$connect()
    
    // Try a simple query
    const result = await prismaWithEnv.$queryRaw`SELECT 1 as test`
    console.log('Database query result:', result)
    
    await prismaWithEnv.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      queryResult: result,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
