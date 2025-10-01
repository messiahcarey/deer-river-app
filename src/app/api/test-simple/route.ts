import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Test simple API called')
    
    return NextResponse.json({
      success: true,
      message: 'Simple API is working',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test simple API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
