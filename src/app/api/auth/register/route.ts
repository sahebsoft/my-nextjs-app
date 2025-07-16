import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'
import { validateData, RegisterSchema } from '@/lib/validation'
import { runMigrations } from '@/lib/migrate'

// Registration tracking for analytics
let registrationCount = 0

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    await runMigrations()
    
    const body = await request.json()

    console.log('📝 Registration attempt:', {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      timestamp: new Date().toISOString()
    })

    // Validate input data
    const validation = validateData(RegisterSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }

    const { firstName, lastName, email, password } = validation.data

    // Register user with database
    const registerResult = await registerUser(email, password, firstName, lastName)

    if (!registerResult.success) {
      console.log(`❌ Registration failed: ${registerResult.message} for ${email}`)

      return NextResponse.json({
        success: false,
        error: registerResult.message
      }, { status: 409 })
    }

    registrationCount++

    // Simulate sending welcome email
    console.log(`📧 Sending welcome email to ${registerResult.user!.email}`)

    console.log(`✅ Registration successful: ${registerResult.user!.first_name} ${registerResult.user!.last_name} (${registerResult.user!.email})`)

    // Return user data (excluding sensitive info)
    const userResponse = {
      id: registerResult.user!.id,
      firstName: registerResult.user!.first_name,
      lastName: registerResult.user!.last_name,
      fullName: `${registerResult.user!.first_name} ${registerResult.user!.last_name}`,
      email: registerResult.user!.email,
      role: registerResult.user!.role,
      status: registerResult.user!.status,
      registeredAt: registerResult.user!.created_at
    }

    return NextResponse.json({
      success: true,
      message: registerResult.message,
      user: userResponse,
      nextSteps: [
        'Check your email for verification link',
        'Verify your email address',
        'Complete your profile setup',
        'Start shopping!'
      ],
      timestamp: new Date().toISOString(),
      analytics: {
        totalRegistrations: registrationCount,
        todayRegistrations: 1
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Registration error:', error)

    return NextResponse.json({
      success: false,
      error: 'Registration processing failed',
      message: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('📊 Registration analytics requested')

  try {
    await runMigrations()
    
    // Get user count from database
    const { query } = await import('@/lib/database')
    const result = await query('SELECT COUNT(*) as count FROM users')
    const totalRegistrations = (result[0] as any).count || 0

    console.log(`📈 Registration analytics: ${totalRegistrations} total users in database`)

    return NextResponse.json({
      success: true,
      analytics: {
        totalRegistrations,
        todayRegistrations: registrationCount,
        thisWeekRegistrations: registrationCount,
        statusBreakdown: {
          pending: 0,
          active: totalRegistrations,
          inactive: 0
        },
        averagePerDay: Math.round(totalRegistrations / 7),
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Registration analytics error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch registration analytics'
    }, { status: 500 })
  }
}
