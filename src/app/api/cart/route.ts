import { NextRequest, NextResponse } from 'next/server'
import { CartModel } from '@/lib/models'
import { runMigrations } from '@/lib/migrate'

export async function GET(request: NextRequest) {
  try {
    await runMigrations()
    
    const sessionId = request.headers.get('x-session-id')
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID required'
      }, { status: 400 })
    }

    const cartItems = await CartModel.getItems(undefined, sessionId)

    return NextResponse.json({
      success: true,
      items: cartItems,
      count: cartItems.length,
      sessionId
    })

  } catch (error) {
    console.error('❌ Cart GET API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cart items',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await runMigrations()
    
    const sessionId = request.headers.get('x-session-id')
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID required'
      }, { status: 400 })
    }

    const cleared = await CartModel.clearCart(undefined, sessionId)

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
      cleared
    })

  } catch (error) {
    console.error('❌ Cart DELETE API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cart',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}