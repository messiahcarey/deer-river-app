import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    console.log('Running database migrations...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
    // Set environment variable explicitly for the command
    const env = { ...process.env }
    if (!env.DATABASE_URL) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL environment variable not found',
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
    
    // Trim whitespace from DATABASE_URL
    env.DATABASE_URL = env.DATABASE_URL.trim()
    
    // Run Prisma migrations with explicit environment
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy', { env })
    
    console.log('Migration output:', stdout)
    if (stderr) {
      console.error('Migration errors:', stderr)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database migrations completed successfully',
      output: stdout,
      stderr: stderr || null,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
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
