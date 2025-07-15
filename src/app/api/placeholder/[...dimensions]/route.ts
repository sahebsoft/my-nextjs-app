import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  const dimensions = params.dimensions || []
  const width = parseInt(dimensions[0]) || 300
  const height = parseInt(dimensions[1]) || 200
  
  console.log(`🖼️ Placeholder image requested: ${width}x${height}`)
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="10%" y="10%" width="80%" height="60%" fill="#e5e7eb" rx="8"/>
      <circle cx="30%" cy="35%" r="8%" fill="#d1d5db"/>
      <rect x="50%" y="25%" width="30%" height="4%" fill="#d1d5db" rx="2"/>
      <rect x="50%" y="35%" width="20%" height="4%" fill="#d1d5db" rx="2"/>
      <rect x="50%" y="45%" width="25%" height="4%" fill="#d1d5db" rx="2"/>
      <text x="50%" y="85%" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="14">
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
