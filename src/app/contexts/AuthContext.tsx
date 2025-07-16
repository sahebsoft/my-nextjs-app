'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role: 'user' | 'admin'
  status: 'active' | 'pending' | 'blocked'
  created_at: Date
  updated_at: Date
  email_verified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: {
    email: string
    password: string
    first_name?: string
    last_name?: string
  }) => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          // Verify token and get user info
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.user) {
              setUser(result.user)
            } else {
              // Invalid token, remove it
              localStorage.removeItem('auth_token')
            }
          } else {
            // Invalid token, remove it
            localStorage.removeItem('auth_token')
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        localStorage.removeItem('auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Store token and user info
        localStorage.setItem('auth_token', result.token)
        setUser(result.user)
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (error: any) {
      setError(error.message || 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    email: string
    password: string
    first_name?: string
    last_name?: string
  }) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Store token and user info
        localStorage.setItem('auth_token', result.token)
        setUser(result.user)
      } else {
        throw new Error(result.error || 'Registration failed')
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      
      // Clear token and user state
      localStorage.removeItem('auth_token')
      setUser(null)
      
      // Optionally call backend logout endpoint
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      } catch (error) {
        // Ignore logout API errors - local logout is more important
        console.error('Logout API error:', error)
      }
    } catch (error: any) {
      setError(error.message || 'Logout failed')
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isLoading,
      isAuthenticated,
      error
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}