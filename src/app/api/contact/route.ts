import { NextRequest, NextResponse } from 'next/server'
import { ContactModel } from '@/lib/models'
import { validateData, ContactSchema } from '@/lib/validation'
import { runMigrations } from '@/lib/migrate'

export async function POST(request: NextRequest) {
  try {
    await runMigrations()
    
    const body = await request.json()
    
    console.log('📧 Contact form submission received:', { 
      name: body.name, 
      email: body.email, 
      subject: body.subject?.substring(0, 50) + '...', 
      urgency: body.urgency 
    })
    
    // Validate input data
    const validation = validateData(ContactSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }
    
    const { name, email, subject, message, urgency } = validation.data
    
    // Create contact submission in database
    const submission = await ContactModel.create({
      name,
      email,
      subject,
      message,
      urgency: urgency || 'medium'
    })
    
    // Simulate email processing delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Simulate sending confirmation email
    console.log(`📨 Sending confirmation email to ${email}`)
    
    // Calculate expected response time based on urgency
    const responseTimeMap: Record<string, string> = {
      'high': '2 hours',
      'medium': '24 hours', 
      'low': '48 hours'
    }
    const responseTime = responseTimeMap[urgency || 'medium'] || '24 hours'
    
    console.log(`✅ Contact submission processed: ID ${submission.id}, Urgency: ${urgency}`)
    
    // Get analytics
    const analytics = await ContactModel.getAnalytics()
    
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Your message has been received successfully',
      expectedResponse: responseTime,
      timestamp: submission.created_at,
      confirmationSent: true,
      analytics: {
        totalSubmissions: analytics.totalSubmissions,
        averageResponseTime: analytics.averageResponseTime
      }
    })
    
  } catch (error) {
    console.error('❌ Contact form error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process contact form',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  console.log('📊 Contact submissions analytics requested')
  
  try {
    await runMigrations()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const urgency = searchParams.get('urgency')
    
    // Get submissions from database
    const submissions = await ContactModel.findAll({ urgency: urgency || undefined })
    const analytics = await ContactModel.getAnalytics()
    
    // Calculate urgency breakdown
    const urgencyBreakdown = {
      high: submissions.filter(s => s.urgency === 'high').length,
      medium: submissions.filter(s => s.urgency === 'medium').length,
      low: submissions.filter(s => s.urgency === 'low').length
    }
    
    // Recent submissions (last 10)
    const recentSubmissions = submissions
      .slice(-10)
      .map(sub => ({
        id: sub.id,
        name: sub.name,
        subject: sub.subject,
        urgency: sub.urgency,
        timestamp: sub.created_at,
        status: sub.status
      }))
    
    console.log(`📈 Contact analytics: ${analytics.totalSubmissions} total submissions`)
    
    return NextResponse.json({
      success: true,
      analytics: {
        totalSubmissions: analytics.totalSubmissions,
        urgencyBreakdown,
        recentSubmissions,
        averagePerDay: Math.round(analytics.totalSubmissions / 7),
        averageResponseTime: analytics.averageResponseTime,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Contact analytics error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contact analytics'
    }, { status: 500 })
  }
}
