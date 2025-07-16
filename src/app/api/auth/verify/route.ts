import { NextRequest, NextResponse } from 'next/server'
import { runMigrations } from '@/lib/migrate'
import { verifyToken } from '@/lib/auth'
import { queryOne } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    await runMigrations()
    
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authorization.split(' ')[1]
    
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Get user from database
    const user = await queryOne(
      'SELECT id, email, first_name, last_name, role, status, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: user
    })
  } catch (error) {
    console.error('Error verifying token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}