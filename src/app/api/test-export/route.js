// Use .js extension instead of .ts for better Amplify compatibility
export async function GET() {
  try {
    console.log('Test export API called')
    
    return Response.json({
      success: true,
      message: 'Test export API is working',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test export API error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error.message
      },
      { status: 500 }
    )
  }
}
