import { NextRequest, NextResponse } from 'next/server'

// In-memory search analytics storage (in real app, use database)
let searchAnalytics = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, timestamp } = body
    
    console.log('🔍 Search API called:', { query, timestamp })
    
    // Store search analytics
    const searchEntry = {
      id: searchAnalytics.length + 1,
      query: query.toLowerCase().trim(),
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.ip || 'unknown'
    }
    
    searchAnalytics.push(searchEntry)
    
    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Basic search suggestions based on common queries
    const suggestions = [
      'wireless headphones',
      'smart watch', 
      'coffee maker',
      'running shoes',
      'laptop',
      'smartphone'
    ].filter(suggestion => 
      suggestion.includes(query.toLowerCase()) && suggestion !== query.toLowerCase()
    )
    
    // Search popularity simulation
    const popularSearches = [
      { term: 'headphones', count: 45 },
      { term: 'laptop', count: 38 },
      { term: 'smartphone', count: 32 },
      { term: 'coffee', count: 28 },
      { term: 'watch', count: 25 }
    ]
    
    console.log(`✅ Search logged: "${query}" (${searchAnalytics.length} total searches)`)
    
    return NextResponse.json({
      success: true,
      searchId: searchEntry.id,
      query: query,
      suggestions: suggestions,
      popularSearches: popularSearches,
      timestamp: searchEntry.timestamp,
      analytics: {
        totalSearches: searchAnalytics.length,
        recentSearches: searchAnalytics.slice(-5).map(s => s.query)
      }
    })
    
  } catch (error) {
    console.error('❌ Search API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Search processing failed',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('📊 Search analytics requested')
  
  // Get query parameters
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  
  // Calculate search statistics
  const totalSearches = searchAnalytics.length
  const uniqueQueries = [...new Set(searchAnalytics.map(s => s.query))].length
  const recentSearches = searchAnalytics.slice(-limit)
  
  // Most popular searches
  const queryCount = {}
  searchAnalytics.forEach(search => {
    queryCount[search.query] = (queryCount[search.query] || 0) + 1
  })
  
  const popularQueries = Object.entries(queryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }))
  
  console.log(`📈 Search analytics: ${totalSearches} total, ${uniqueQueries} unique`)
  
  return NextResponse.json({
    success: true,
    analytics: {
      totalSearches,
      uniqueQueries,
      recentSearches: recentSearches.map(s => ({
        query: s.query,
        timestamp: s.timestamp
      })),
      popularQueries,
      lastUpdated: new Date().toISOString()
    }
  })
}
