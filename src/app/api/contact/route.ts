import { NextRequest, NextResponse } from 'next/server'

// In-memory contact storage (in real app, use database/email service)
let contactSubmissions = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, urgency, timestamp } = body
    
    console.log('📧 Contact form submission received:', { 
      name, 
      email, 
      subject: subject.substring(0, 50) + '...', 
      urgency 
    })
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        required: ['name', 'email', 'subject', 'message']
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
    
    // Create contact submission record
    const submission = {
      id: contactSubmissions.length + 1,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      urgency: urgency || 'medium',
      timestamp: timestamp || new Date().toISOString(),
      status: 'received',
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.ip || 'unknown'
    }
    
    // Store submission
    contactSubmissions.push(submission)
    
    // Simulate email processing delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Simulate sending confirmation email
    console.log(`📨 Sending confirmation email to ${email}`)
    
    // Calculate expected response time based on urgency
    const responseTime = {
      'high': '2 hours',
      'medium': '24 hours', 
      'low': '48 hours'
    }[urgency] || '24 hours'
    
    console.log(`✅ Contact submission processed: ID ${submission.id}, Urgency: ${urgency}`)
    
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Your message has been received successfully',
      expectedResponse: responseTime,
      timestamp: submission.timestamp,
      confirmationSent: true,
      analytics: {
        totalSubmissions: contactSubmissions.length,
        averageResponseTime: responseTime
      }
    })
    
  } catch (error) {
    console.error('❌ Contact form error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process contact form',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('📊 Contact submissions analytics requested')
  
  // Get query parameters
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const urgency = searchParams.get('urgency')
  
  let filteredSubmissions = [...contactSubmissions]
  
  // Filter by urgency if specified
  if (urgency) {
    filteredSubmissions = filteredSubmissions.filter(sub => sub.urgency === urgency)
  }
  
  // Calculate analytics
  const totalSubmissions = contactSubmissions.length
  const urgencyBreakdown = {
    high: contactSubmissions.filter(s => s.urgency === 'high').length,
    medium: contactSubmissions.filter(s => s.urgency === 'medium').length,
    low: contactSubmissions.filter(s => s.urgency === 'low').length
  }
  
  const recentSubmissions = filteredSubmissions
    .slice(-limit)
    .map(sub => ({
      id: sub.id,
      name: sub.name,
      subject: sub.subject,
      urgency: sub.urgency,
      timestamp: sub.timestamp,
      status: sub.status
    }))
  
  console.log(`📈 Contact analytics: ${totalSubmissions} total submissions`)
  
  return NextResponse.json({
    success: true,
    analytics: {
      totalSubmissions,
      urgencyBreakdown,
      recentSubmissions,
      averagePerDay: Math.round(totalSubmissions / 7), // Simulate weekly average
      lastUpdated: new Date().toISOString()
    }
  })
}
