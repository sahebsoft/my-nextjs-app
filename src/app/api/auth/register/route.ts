import { NextRequest, NextResponse } from 'next/server'

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  status: string;
  registeredAt: string;
  lastLogin: string | null;
  userAgent: string;
  ip: string;
}
// In-memory user registration storage
let registeredUsers: Array<User> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = body

    console.log('📝 Registration attempt:', {
      firstName,
      lastName,
      email,
      timestamp: new Date().toISOString()
    })

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required',
        required: ['firstName', 'lastName', 'email', 'password']
      }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address'
      }, { status: 400 })
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      console.log(`❌ Registration failed: Email ${email} already exists`)

      return NextResponse.json({
        success: false,
        error: 'An account with this email already exists'
      }, { status: 409 })
    }

    // Simulate registration processing delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Create new user
    const newUser: User = {
      id: registeredUsers.length + 1,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In real app, hash with bcrypt
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      role: 'user',
      status: 'pending', // Email verification pending
      registeredAt: new Date().toISOString(),
      lastLogin: null,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.ip || 'unknown'
    }

    registeredUsers.push(newUser)

    // Simulate sending welcome email
    console.log(`📧 Sending welcome email to ${newUser.email}`)

    console.log(`✅ Registration successful: ${newUser.fullName} (${newUser.email})`)

    // Return user data (excluding sensitive info)
    const userResponse = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      registeredAt: newUser.registeredAt
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: userResponse,
      nextSteps: [
        'Check your email for verification link',
        'Verify your email address',
        'Complete your profile setup',
        'Start shopping!'
      ],
      timestamp: new Date().toISOString(),
      analytics: {
        totalRegistrations: registeredUsers.length,
        todayRegistrations: registeredUsers.filter(u =>
          new Date(u.registeredAt).toDateString() === new Date().toDateString()
        ).length
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

  // Calculate registration statistics
  const totalRegistrations = registeredUsers.length
  const todayRegistrations = registeredUsers.filter(u =>
    new Date(u.registeredAt).toDateString() === new Date().toDateString()
  ).length

  const thisWeekRegistrations = registeredUsers.filter(u => {
    const registrationDate = new Date(u.registeredAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return registrationDate >= weekAgo
  }).length

  // Status breakdown
  const statusBreakdown = {
    pending: registeredUsers.filter(u => u.status === 'pending').length,
    active: registeredUsers.filter(u => u.status === 'active').length,
    inactive: registeredUsers.filter(u => u.status === 'inactive').length
  }

  // Recent registrations (last 10)
  const recentRegistrations = registeredUsers
    .slice(-10)
    .map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      status: user.status,
      registeredAt: user.registeredAt
    }))

  // Registration trends by day
  const registrationsByDay: { [day: string]: number } = {}
  registeredUsers.forEach(user => {
    const day = new Date(user.registeredAt).toDateString()
    registrationsByDay[day] = (registrationsByDay[day] || 0) + 1
  })

  console.log(`📈 Registration analytics: ${totalRegistrations} total, ${todayRegistrations} today`)

  return NextResponse.json({
    success: true,
    analytics: {
      totalRegistrations,
      todayRegistrations,
      thisWeekRegistrations,
      statusBreakdown,
      recentRegistrations,
      registrationsByDay,
      averagePerDay: Math.round(totalRegistrations / 7),
      lastUpdated: new Date().toISOString()
    }
  })
}
