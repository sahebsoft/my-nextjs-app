'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Login/Register Forms Component
function AuthForms() {
  const [activeTab, setActiveTab] = useState('login')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { login, register, isLoading, error } = useAuth()

  const validateLogin = () => {
    const newErrors: Record<string, string> = {}

    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!loginData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegister = () => {
    const newErrors: Record<string, string> = {}

    if (!registerData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!registerData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!registerData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLogin()) return

    try {
      await login(loginData.email, loginData.password)
    } catch (error) {
      // Error is handled by context
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return

    try {
      await register({
        email: registerData.email,
        password: registerData.password,
        first_name: registerData.firstName,
        last_name: registerData.lastName
      })
    } catch (error) {
      // Error is handled by context
    }
  }

  const handleInputChange = (formType: string, field: string, value: string) => {
    if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [field]: value }))
    } else {
      setRegisterData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6">
          {/* General Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
              
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    value={loginData.email}
                    onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    value={loginData.password}
                    onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Demo credentials: demo@example.com / password123
                </p>
              </div>
            </div>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
              
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first-name"
                      value={registerData.firstName}
                      onChange={(e) => handleInputChange('register', 'firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="First name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      value={registerData.lastName}
                      onChange={(e) => handleInputChange('register', 'lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    value={registerData.email}
                    onChange={(e) => handleInputChange('register', 'email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="register-password"
                    value={registerData.password}
                    onChange={(e) => handleInputChange('register', 'password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Create a password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={registerData.confirmPassword}
                    onChange={(e) => handleInputChange('register', 'confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// User Dashboard Component
function UserDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/account')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
              <p className="text-gray-600">Welcome back, {user.first_name || user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.first_name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.last_name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status
                  </label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Order History</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/order-confirmation/${order.orderNumber}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Password</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Change Password
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                      <span className="ml-2 text-sm text-gray-700">Email notifications for orders</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                      <span className="ml-2 text-sm text-gray-700">Marketing emails</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3 text-red-600">Danger Zone</h3>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {user ? <UserDashboard /> : <AuthForms />}
    </div>
  )
}