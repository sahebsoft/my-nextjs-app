import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { validateData, LoginSchema } from '@/lib/validation'
import { runMigrations, seedInitialData } from '@/lib/migrate'

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

// In-memory login attempts storage (for analytics)
let loginAttempts: LoginAttempt[] = []

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    await runMigrations()
    await seedInitialData()
    
    const body = await request.json()
    
    console.log('🔐 Login attempt:', { email: body.email, timestamp: new Date().toISOString() })

    // Validate input data
    const validation = validateData(LoginSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }

    const { email, password } = validation.data

    // Record login attempt
    const loginAttempt: LoginAttempt = {
      id: loginAttempts.length + 1,
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.ip || 'unknown',
      success: false
    }

    // Authenticate user with database
    const authResult = await authenticateUser(email, password)

    if (!authResult.success) {
      loginAttempt.reason = authResult.message
      loginAttempts.push(loginAttempt)

      console.log(`❌ Login failed: ${authResult.message} for ${email}`)

      return NextResponse.json({
        success: false,
        error: authResult.message
      }, { status: 401 })
    }

    // Successful login
    loginAttempt.success = true
    loginAttempt.userId = authResult.user!.id
    loginAttempts.push(loginAttempt)

    console.log(`✅ Login successful: ${authResult.user!.first_name} ${authResult.user!.last_name} (${authResult.user!.email})`)

    // Return user data and JWT token
    const userResponse = {
      id: authResult.user!.id,
      email: authResult.user!.email,
      name: `${authResult.user!.first_name || ''} ${authResult.user!.last_name || ''}`.trim(),
      firstName: authResult.user!.first_name,
      lastName: authResult.user!.last_name,
      role: authResult.user!.role
    }

    return NextResponse.json({
      success: true,
      message: authResult.message,
      user: userResponse,
      token: authResult.token,
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
        message: 'Check the database for demo users or register a new account',
        registerEndpoint: '/api/auth/register'
      },
      lastUpdated: new Date().toISOString()
    }
  })
}
