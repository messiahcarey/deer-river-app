import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ 
    success: false, 
    error: 'CSV import not implemented yet' 
  }, { status: 501 })
}
