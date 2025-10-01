// Test API using Pages Router approach
export default function handler(req, res) {
  try {
    console.log('Pages Router API called')
    
    res.status(200).json({
      success: true,
      message: 'Pages Router API is working',
      timestamp: new Date().toISOString(),
      method: req.method
    })
  } catch (error) {
    console.error('Pages Router API error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: error.message
    })
  }
}
