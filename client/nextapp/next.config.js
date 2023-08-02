/** @type {import('next').NextConfig} */
const nextConfig = {
  //publicRuntimeConfig is for using env variables in production
  //inspired by https://raphaelpralat.medium.com/system-environment-variables-in-next-js-with-docker-1f0754e04cde
  publicRuntimeConfig: {
    backendPath: process.env.NEXT_PUBLIC_API_URL,
  },
  reactStrictMode: false,
  swcMinify: true,
  images: {
    // domains: [],
    // formats: [],
  },
  //i18n,
  //TODO: Remove the redirect as soon as the index page contains useful content
  async redirects() {
    return [
      {
        source: '/',
        destination: '/flights',
        permanent: true,
      },
    ]
  },
  rewrites() {
    return [
      {
        source: '/',
        destination: '/home',
      },
    ]
  },
}

module.exports = nextConfig
