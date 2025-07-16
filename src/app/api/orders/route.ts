import { NextRequest, NextResponse } from 'next/server'
import { OrderModel } from '@/lib/models'
import { runMigrations } from '@/lib/migrate'

export async function GET(request: NextRequest) {
  try {
    await runMigrations()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const orderNumber = searchParams.get('orderNumber')
    
    let orders
    if (orderNumber) {
      const order = await OrderModel.findByOrderNumber(orderNumber)
      orders = order ? [order] : []
    } else if (userId) {
      orders = await OrderModel.getOrdersByUser(parseInt(userId))
    } else {
      orders = await OrderModel.findAll()
    }

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        subtotal: order.subtotal,
        taxAmount: order.tax_amount,
        shippingAmount: order.shipping_amount,
        discountAmount: order.discount_amount,
        totalAmount: order.total_amount,
        currency: order.currency,
        paymentMethod: order.payment_method,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        notes: order.notes,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }))
    })

  } catch (error) {
    console.error('❌ Orders API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}