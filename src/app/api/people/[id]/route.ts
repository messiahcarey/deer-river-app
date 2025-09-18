import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // For now, just return success - in a real app this would update the database
    console.log('Updating person:', params.id, body)
    
    return NextResponse.json({
      success: true,
      data: { ...body, id: params.id }
    })
  } catch (error) {
    console.error('Error updating person:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update person' 
    }, { status: 500 })
  }
}
