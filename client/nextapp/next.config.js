const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  //publicRuntimeConfig is for using env variables in production
  //inspired by https://raphaelpralat.medium.com/system-environment-variables-in-next-js-with-docker-1f0754e04cde
  // publicRuntimeConfig: {
  //   backendPath: process.env.NEXT_PUBLIC_API_URL,
  // },
  reactStrictMode: false,
  swcMinify: true,
  //experimental: { newNextLinkBehavior: true },
  images: {
    // domains: [],
    // formats: [],
  },
  i18n,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/home',
      },
    ]
  },
  //   async redirects() {},
}

module.exports = nextConfig
