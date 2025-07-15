import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  const dimensions = params.dimensions || []
  const width = parseInt(dimensions[0]) || 300
  const height = parseInt(dimensions[1]) || 200
  
  console.log(`🖼️ Placeholder image requested: ${width}x${height}`)
  
  // Create a more realistic product image placeholder
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${randomColor};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${randomColor};stop-opacity:0.3" />
        </linearGradient>
        <linearGradient id="product" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${randomColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${randomColor};stop-opacity:0.6" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Product shape -->
      <rect x="20%" y="20%" width="60%" height="50%" fill="url(#product)" rx="8"/>
      
      <!-- Product details -->
      <circle cx="35%" cy="35%" r="3%" fill="white" opacity="0.8"/>
      <rect x="45%" y="30%" width="25%" height="3%" fill="white" opacity="0.8" rx="1"/>
      <rect x="45%" y="38%" width="20%" height="3%" fill="white" opacity="0.6" rx="1"/>
      <rect x="45%" y="46%" width="15%" height="3%" fill="white" opacity="0.4" rx="1"/>
      
      <!-- Brand badge -->
      <rect x="5%" y="5%" width="25%" height="12%" fill="white" opacity="0.9" rx="4"/>
      <text x="17.5%" y="12%" text-anchor="middle" fill="${randomColor}" font-family="Arial" font-size="10" font-weight="bold">
        DEMO
      </text>
      
      <!-- Size indicator -->
      <text x="50%" y="90%" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="12" opacity="0.7">
        ${width} × ${height}
      </text>
    </svg>
  `
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
