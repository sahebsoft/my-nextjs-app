import { NextRequest, NextResponse } from 'next/server'

// Mock user database
const USERS = [
  {
    id: 1,
    email: 'demo@example.com',
    password: 'password123', // In real app, this would be hashed
    name: 'Demo User',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    email: 'admin@aistore.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]

// Login attempt interface
interface LoginAttempt {
  id: number;
  email: string;
  timestamp: string;
  userAgent: string;
  ip: string;
  success: boolean;
  reason?: string;
  userId?: number;
}

// In-memory login attempts storage
let loginAttempts: LoginAttempt[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔐 Login attempt:', { email, timestamp: new Date().toISOString() })

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Record login attempt
    const loginAttempt: LoginAttempt = {
      id: loginAttempts.length + 1,
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.ip || 'unknown',
      success: false
    }

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Find user
    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      loginAttempt.reason = 'User not found'
      loginAttempts.push(loginAttempt)

      console.log(`❌ Login failed: User not found for ${email}`)

      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    // Check password (in real app, use bcrypt)
    if (user.password !== password) {
      loginAttempt.reason = 'Invalid password'
      loginAttempts.push(loginAttempt)

      console.log(`❌ Login failed: Invalid password for ${email}`)

      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    // Successful login
    loginAttempt.success = true
    loginAttempt.userId = user.id
    loginAttempts.push(loginAttempt)

    // Create session token (in real app, use JWT or session storage)
    const sessionToken = `session_${user.id}_${Date.now()}`

    console.log(`✅ Login successful: ${user.name} (${user.email})`)

    // Return user data (excluding sensitive info)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      sessionToken,
      timestamp: new Date().toISOString(),
      analytics: {
        totalLoginAttempts: loginAttempts.length,
        successfulLogins: loginAttempts.filter(a => a.success).length,
        failedLogins: loginAttempts.filter(a => !a.success).length
      }
    })

  } catch (error) {
    console.error('❌ Login error:', error)

    return NextResponse.json({
      success: false,
      error: 'Login processing failed',
      message: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('📊 Login analytics requested')

  // Calculate login statistics
  const totalAttempts = loginAttempts.length
  const successfulLogins = loginAttempts.filter(a => a.success).length
  const failedLogins = loginAttempts.filter(a => !a.success).length
  const successRate = totalAttempts > 0 ? (successfulLogins / totalAttempts * 100).toFixed(2) : '0'

  // Recent login attempts (last 10)
  const recentAttempts = loginAttempts
    .slice(-10)
    .map(attempt => ({
      id: attempt.id,
      email: attempt.email,
      success: attempt.success,
      reason: attempt.reason,
      timestamp: attempt.timestamp
    }))

  // Failed login reasons breakdown
  const failureReasons: { [key: string]: number } = {}
  loginAttempts.filter(a => !a.success).forEach(attempt => {
    if (attempt.reason !== undefined) {
      failureReasons[attempt.reason] = (failureReasons[attempt.reason] || 0) + 1
    }
  })

  console.log(`📈 Login analytics: ${successfulLogins}/${totalAttempts} successful (${successRate}%)`)

  return NextResponse.json({
    success: true,
    analytics: {
      totalAttempts,
      successfulLogins,
      failedLogins,
      successRate: parseFloat(successRate),
      recentAttempts,
      failureReasons,
      demoCredentials: {
        email: 'demo@example.com',
        password: 'password123'
      },
      lastUpdated: new Date().toISOString()
    }
  })
}
