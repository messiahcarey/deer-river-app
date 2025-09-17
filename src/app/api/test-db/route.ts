import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
