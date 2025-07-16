import { NextRequest, NextResponse } from 'next/server'
import { OrderModel } from '@/lib/models'
import { validateData, OrderUpdateSchema } from '@/lib/validation'
import { runMigrations } from '@/lib/migrate'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await runMigrations()
    
    const orderId = parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid order ID'
      }, { status: 400 })
    }

    const order = await OrderModel.findWithItems(orderId)
    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order: {
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
        updatedAt: order.updated_at,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          productSnapshot: item.product_snapshot,
          createdAt: item.created_at
        }))
      }
    })

  } catch (error) {
    console.error('❌ Order details API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch order details',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await runMigrations()
    
    const orderId = parseInt(params.id)
    if (isNaN(orderId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid order ID'
      }, { status: 400 })
    }

    const body = await request.json()
    
    // Validate input data
    const validation = validateData(OrderUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }

    const { status, paymentStatus, trackingNumber, notes } = validation.data

    // Update order
    if (status) {
      await OrderModel.updateStatus(orderId, status)
    }

    if (paymentStatus) {
      await OrderModel.updatePaymentStatus(orderId, paymentStatus)
    }

    // Get updated order
    const updatedOrder = await OrderModel.findById(orderId)
    if (!updatedOrder) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.payment_status,
        totalAmount: updatedOrder.total_amount,
        updatedAt: updatedOrder.updated_at
      }
    })

  } catch (error) {
    console.error('❌ Order update API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update order',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}