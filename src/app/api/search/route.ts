import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query, timestamp } = await request.json()

    // 🤖 AI FIX: Validate search input
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid search query' },
        { status: 400 }
      )
    }

    // 🤖 AI FIX: Log search for analytics (in real app, save to database)
    const searchLog = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || 'unknown'
    }

    console.log('Search logged:', searchLog)

    // 🤖 AI FIX: Return search suggestions and analytics
    const suggestions = [
      'Wireless headphones',
      'Smart watch', 
      'Coffee maker',
      'Running shoes'
    ].filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    )

    return NextResponse.json({
      success: true,
      query: query.trim(),
      suggestions,
      timestamp: searchLog.timestamp,
      message: 'Search logged successfully'
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search service temporarily unavailable' },
      { status: 500 }
    )
  }
}
