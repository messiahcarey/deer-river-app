import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Debug environment variables',
      data: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        DATABASE_URL_MASKED: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@') : 'Not set',
        NODE_ENV: process.env.NODE_ENV,
        allEnvVars: Object.keys(process.env).filter(key => key.includes('DATABASE')),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
