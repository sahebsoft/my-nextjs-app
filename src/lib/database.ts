import mysql from 'mysql2/promise'

interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

const config: DatabaseConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'my_store'
}

let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const pool = getPool()
  const [rows] = await pool.execute(sql, params)
  return rows as T[]
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(sql, params)
  return results[0] || null
}

export async function transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const pool = getPool()
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default { getPool, query, queryOne, transaction }