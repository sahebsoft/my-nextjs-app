/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next-dev'
}

module.exports = nextConfig
