'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: { id: number; name: string; price: number; image: string }, quantity: number) => Promise<void>
  removeFromCart: (itemId: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  getItemCount: () => number
  getTotalPrice: () => number
  clearCart: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get or create session ID (centralized function)
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  // Load cart from database on component mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const sessionId = getSessionId()
        const response = await fetch('/api/cart', {
          headers: {
            'x-session-id': sessionId
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.items) {
            // Transform database items to match CartItem interface
            const transformedItems = result.items.map((item: any) => ({
              id: item.id, // Use database ID directly
              productId: item.product_id,
              name: item.product_name || item.name,
              price: parseFloat(item.price),
              quantity: item.quantity,
              image: item.image_url || item.product_image || item.image || '/api/placeholder/300/200'
            }))
            setItems(transformedItems)
            console.log('✅ Cart loaded from database:', transformedItems.length, 'items')
          } else {
            setItems([])
          }
        } else {
          throw new Error('Failed to load cart')
        }
      } catch (error) {
        console.error('Error loading cart from database:', error)
        setError('Failed to load cart')
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  const addToCart = async (product: { id: number; name: string; price: number; image: string }, quantity: number) => {
    try {
      setError(null)
      
      const sessionId = getSessionId()
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      })

      const result = await response.json()

      if (result.success) {
        // Reload cart from database to ensure sync
        const cartResponse = await fetch('/api/cart', {
          headers: {
            'x-session-id': sessionId
          }
        })
        
        if (cartResponse.ok) {
          const cartResult = await cartResponse.json()
          if (cartResult.success && cartResult.items) {
            const transformedItems = cartResult.items.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              name: item.product_name || item.name,
              price: parseFloat(item.price),
              quantity: item.quantity,
              image: item.image_url || item.product_image || item.image || '/api/placeholder/300/200'
            }))
            setItems(transformedItems)
          }
        }
      } else {
        throw new Error(result.error || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error adding item to cart:', error)
      setError('Failed to add item to cart')
    }
  }

  const removeFromCart = async (itemId: number) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/cart/remove/${itemId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // Update local state by removing the item
        setItems(prev => prev.filter(item => item.id !== itemId))
      } else {
        throw new Error(result.error || 'Failed to remove item from cart')
      }
    } catch (error) {
      console.error('Error removing item from cart:', error)
      setError('Failed to remove item from cart')
    }
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setError(null)

      if (quantity <= 0) {
        await removeFromCart(itemId)
        return
      }

      const response = await fetch(`/api/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: quantity
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state with new quantity
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          )
        )
      } else {
        throw new Error(result.error || 'Failed to update item quantity')
      }
    } catch (error) {
      console.error('Error updating item quantity:', error)
      setError('Failed to update item quantity')
    }
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const clearCart = async () => {
    try {
      setError(null)
      
      const sessionId = getSessionId()
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId
        }
      })

      const result = await response.json()

      if (result.success) {
        // Clear local state
        setItems([])
      } else {
        throw new Error(result.error || 'Failed to clear cart')
      }
    } catch (error) {
      console.error('Error clearing cart from database:', error)
      setError('Failed to clear cart')
    }
  }

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      getItemCount,
      getTotalPrice,
      clearCart,
      isLoading,
      error
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}