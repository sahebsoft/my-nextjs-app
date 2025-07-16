'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '../contexts/CartContext'

export default function CartPage() {
  const { items: cartItems, updateQuantity, removeFromCart, isLoading, error } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const discount = subtotal * (promoDiscount / 100)
  const total = subtotal + shipping + tax - discount

  // Update quantity with context
  const updateQuantityHandler = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId)
      return
    }

    setIsUpdating(true)
    
    try {
      await updateQuantity(itemId, newQuantity)
    } catch (error) {
      console.error('Failed to update quantity:', error)
      alert('Failed to update item quantity. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Remove item from cart with context
  const removeItemHandler = async (itemId: number) => {
    setIsUpdating(true)

    try {
      await removeFromCart(itemId)
    } catch (error) {
      console.error('Failed to remove item:', error)
      alert('Failed to remove item. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Apply promo code
  const applyPromoCode = async () => {
    setPromoError('')
    
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }

    try {
      // Simulate API call to validate promo code
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock promo codes
      const promoCodes = {
        'SAVE10': 10,
        'WELCOME20': 20,
        'NEWUSER': 15
      }

      const discount = promoCodes[promoCode.toUpperCase() as keyof typeof promoCodes]
      
      if (discount) {
        setPromoDiscount(discount)
        setPromoError('')
        alert(`Promo code applied! ${discount}% discount`)
      } else {
        setPromoError('Invalid promo code')
      }
    } catch (error) {
      setPromoError('Failed to apply promo code')
    }
  }

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!')
      return
    }
    
    // Navigate to checkout page
    window.location.href = '/checkout'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-300 w-20 h-20 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                      <div className="bg-gray-300 h-4 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="bg-gray-300 h-6 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="bg-gray-300 h-4 rounded"></div>
                <div className="bg-gray-300 h-4 rounded"></div>
                <div className="bg-gray-300 h-4 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold">Error Loading Cart</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <Link 
            href="/products"
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-24 h-24 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 18a2 2 0 11-4 0 2 2 0 014 0zM9 18a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link 
              href="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                Cart Items ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h2>
              
              {cartItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-blue-600">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantityHandler(item.id, item.quantity - 1)}
                          disabled={isUpdating}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-x border-gray-300 text-center min-w-[50px]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantityHandler(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItemHandler(item.id)}
                        disabled={isUpdating}
                        className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter code"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-red-500 text-sm mt-1">{promoError}</p>
                  )}
                  {promoDiscount > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      {promoDiscount}% discount applied!
                    </p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Try: SAVE10, WELCOME20, NEWUSER
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({promoDiscount}%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Shipping 
                      {subtotal > 100 && <span className="text-green-600 text-sm ml-1">(Free)</span>}
                    </span>
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

                {/* Free Shipping Notice */}
                {subtotal < 100 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-blue-700">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={proceedToCheckout}
                  disabled={cartItems.length === 0 || isUpdating}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Proceed to Checkout'}
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
        )}
      </div>
    </div>
  )
}