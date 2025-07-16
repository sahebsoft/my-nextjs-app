'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '../contexts/CartContext'

interface Address {
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items: cartItems, clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  })

  const [billingAddress, setBillingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  })

  const [paymentMethod, setPaymentMethod] = useState<'demo' | 'stripe' | 'paypal'>('demo')

  useEffect(() => {
    // Add a delay to ensure cart context is fully loaded
    const timer = setTimeout(() => {
      if (cartItems !== undefined) {
        setLoading(false)
        // Only redirect if cart is empty and not in testing mode
        if (cartItems.length === 0 && !window.location.search.includes('test=true')) {
          console.log('Cart is empty, redirecting to cart page')
          router.push('/cart')
        }
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [cartItems, router])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleShippingChange = (field: keyof Address, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
    if (errors[`shipping.${field}`]) {
      setErrors(prev => ({ ...prev, [`shipping.${field}`]: '' }))
    }
  }

  const handleBillingChange = (field: keyof Address, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }))
    if (errors[`billing.${field}`]) {
      setErrors(prev => ({ ...prev, [`billing.${field}`]: '' }))
    }
  }

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked)
    if (checked) {
      setBillingAddress(shippingAddress)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate shipping address
    const requiredFields: (keyof Address)[] = ['firstName', 'lastName', 'address1', 'city', 'state', 'zipCode']
    requiredFields.forEach(field => {
      if (!shippingAddress[field].trim()) {
        newErrors[`shipping.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      }
    })

    // Validate billing address if different from shipping
    if (!sameAsBilling) {
      requiredFields.forEach(field => {
        if (!billingAddress[field].trim()) {
          newErrors[`billing.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setProcessing(true)
    
    try {
      const sessionId = localStorage.getItem('sessionId') || `session_${Date.now()}`
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          shippingAddress,
          billingAddress: sameAsBilling ? shippingAddress : billingAddress,
          paymentMethod
        })
      })

      const data = await response.json()

      if (data.success) {
        // Clear cart
        clearCart()
        
        // Redirect to success page
        router.push(`/order-confirmation/${data.order.orderNumber}`)
      } else {
        alert(`Checkout failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred during checkout. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show empty cart message if no items
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
            <Link 
              href="/cart"
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Cart
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H21" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Add some items to your cart to proceed with checkout.
            </p>
            <Link 
              href="/products"
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <Link 
            href="/cart"
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cart
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleShippingChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['shipping.firstName'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors['shipping.firstName'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shipping.firstName']}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleShippingChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['shipping.lastName'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors['shipping.lastName'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shipping.lastName']}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address1}
                    onChange={(e) => handleShippingChange('address1', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['shipping.address1'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors['shipping.address1'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['shipping.address1']}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address2}
                    onChange={(e) => handleShippingChange('address2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['shipping.city'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors['shipping.city'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shipping.city']}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleShippingChange('state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['shipping.state'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors['shipping.state'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shipping.state']}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors['shipping.zipCode'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors['shipping.zipCode'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['shipping.zipCode']}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => handleShippingChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Billing Address</h2>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Same as shipping address</span>
                  </label>
                </div>
                
                {!sameAsBilling && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={billingAddress.firstName}
                          onChange={(e) => handleBillingChange('firstName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors['billing.firstName'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {errors['billing.firstName'] && (
                          <p className="text-red-500 text-sm mt-1">{errors['billing.firstName']}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={billingAddress.lastName}
                          onChange={(e) => handleBillingChange('lastName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors['billing.lastName'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {errors['billing.lastName'] && (
                          <p className="text-red-500 text-sm mt-1">{errors['billing.lastName']}</p>
                        )}
                      </div>
                    </div>
                    {/* Add similar fields for billing address */}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="demo"
                      checked={paymentMethod === 'demo'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'demo')}
                      className="mr-3"
                    />
                    <span>Demo Payment (for testing)</span>
                  </label>
                  <label className="flex items-center opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      disabled
                      className="mr-3"
                    />
                    <span>Credit Card (Stripe) - Coming Soon</span>
                  </label>
                  <label className="flex items-center opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      disabled
                      className="mr-3"
                    />
                    <span>PayPal - Coming Soon</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Place Order'}
                </button>

                {/* Security Notice */}
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure 256-bit SSL encryption
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}