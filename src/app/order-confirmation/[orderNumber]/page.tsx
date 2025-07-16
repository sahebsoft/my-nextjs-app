'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { OrderModel } from '@/lib/models'

interface OrderDetails {
  id: number
  orderNumber: string
  status: string
  paymentStatus: string
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  paymentMethod: string
  shippingAddress: any
  billingAddress: any
  notes: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    productSnapshot: any
  }>
}

export default function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders?orderNumber=${params.orderNumber}`)
        const data = await response.json()

        if (data.success && data.orders.length > 0) {
          const orderData = data.orders[0]
          
          // Fetch order details with items
          const detailsResponse = await fetch(`/api/orders/${orderData.id}`)
          const detailsData = await detailsResponse.json()

          if (detailsData.success) {
            setOrder(detailsData.order)
          } else {
            setError('Failed to load order details')
          }
        } else {
          setError('Order not found')
        }
      } catch (err) {
        setError('Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.orderNumber])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Order Not Found</h1>
            <p className="text-red-600 mb-6">{error || 'The order you are looking for could not be found.'}</p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-green-800">Order Confirmed!</h1>
              <p className="text-green-600">Thank you for your purchase. Your order has been successfully placed.</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Order Details</h2>
            <span className="text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Order Number</h3>
              <p className="text-gray-600">{order.orderNumber}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Status</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : order.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Payment Status</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.paymentStatus === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : order.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Payment Method</h3>
              <p className="text-gray-600">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-800 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={item.productSnapshot?.image_url || '/api/placeholder/60/60'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{item.productName}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: ${parseFloat(item.unitPrice.toString()).toFixed(2)} each</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">${parseFloat(item.totalPrice.toString()).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t pt-6 mt-6">
            <div className="max-w-sm ml-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${parseFloat(order.subtotal.toString()).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {parseFloat(order.shippingAmount.toString()) === 0 ? 'Free' : `$${parseFloat(order.shippingAmount.toString()).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">${parseFloat(order.taxAmount.toString()).toFixed(2)}</span>
              </div>
              {parseFloat(order.discountAmount.toString()) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${parseFloat(order.discountAmount.toString()).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${parseFloat(order.totalAmount.toString()).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="font-medium text-gray-800 mb-4">Shipping Address</h3>
          <div className="text-gray-600">
            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
            <p>{order.shippingAddress.address1}</p>
            {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-medium text-blue-800 mb-4">What's Next?</h3>
          <div className="space-y-2 text-blue-700">
            <p>• You will receive an email confirmation shortly</p>
            <p>• Your order will be processed within 1-2 business days</p>
            <p>• You'll receive a shipping confirmation with tracking information</p>
            <p>• Estimated delivery: 3-5 business days</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            View My Account
          </Link>
        </div>
      </div>
    </div>
  )
}