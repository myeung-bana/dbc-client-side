import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  env: {
    NHOST_SUBDOMAIN: process.env.NHOST_SUBDOMAIN,
    NHOST_REGION: process.env.NHOST_REGION,
  },
}

export default withSerwist(nextConfig)
