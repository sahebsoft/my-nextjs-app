import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query, queryOne } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface User {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role: 'user' | 'admin'
  status: 'active' | 'pending' | 'blocked'
  created_at: Date
  email_verified: boolean
}

export interface LoginResult {
  success: boolean
  user?: User
  token?: string
  message: string
}

export interface RegisterResult {
  success: boolean
  user?: Omit<User, 'password_hash'>
  message: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    return decoded
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<LoginResult> {
  try {
    // Find user by email
    const user = await queryOne<User & { password_hash: string }>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Invalid email or password'
      }
    }

    if (user.status === 'blocked') {
      return {
        success: false,
        message: 'Account is blocked. Please contact support.'
      }
    }

    // Generate JWT token
    const token = generateToken(user.id)

    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      message: 'Authentication failed'
    }
  }
}

export async function registerUser(
  email: string, 
  password: string, 
  firstName?: string, 
  lastName?: string
): Promise<RegisterResult> {
  try {
    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Insert new user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES (?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName]
    ) as any

    // Get the created user
    const newUser = await queryOne<User>(
      'SELECT id, email, first_name, last_name, role, status, created_at, email_verified FROM users WHERE id = ?',
      [result.insertId]
    )

    return {
      success: true,
      user: newUser!,
      message: 'Registration successful! Please check your email to verify your account.'
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      message: 'Registration failed'
    }
  }
}

export async function getUserById(id: number): Promise<User | null> {
  return await queryOne<User>(
    'SELECT id, email, first_name, last_name, role, status, created_at, email_verified FROM users WHERE id = ?',
    [id]
  )
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await queryOne<User>(
    'SELECT id, email, first_name, last_name, role, status, created_at, email_verified FROM users WHERE email = ?',
    [email]
  )
}