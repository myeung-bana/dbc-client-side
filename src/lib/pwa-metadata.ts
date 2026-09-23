import type { Metadata, Viewport } from 'next'
import type { MetadataRoute } from 'next'
import { APP_NAME, APP_SHORT_NAME, APP_TAGLINE } from '@/lib/brand'

/** Matches the Gachi app icon background in `/public/brand/app-icon.svg`. */
export const BRAND_THEME_COLOR = '#18261e'
export const BRAND_BACKGROUND_COLOR = '#18261e'

const BRAND_ICON_BASE = '/brand'

export const BRAND_ICONS = {
  faviconSvg: `${BRAND_ICON_BASE}/favicon.svg`,
  faviconIco: `${BRAND_ICON_BASE}/favicon.ico`,
  favicon16: `${BRAND_ICON_BASE}/favicon-16x16.png`,
  favicon32: `${BRAND_ICON_BASE}/favicon-32x32.png`,
  favicon48: `${BRAND_ICON_BASE}/favicon-48x48.png`,
  appleTouchIcon: `${BRAND_ICON_BASE}/apple-touch-icon.png`,
  icon192: `${BRAND_ICON_BASE}/icon-192.png`,
  icon512: `${BRAND_ICON_BASE}/icon-512.png`,
  icon1024: `${BRAND_ICON_BASE}/icon-1024.png`,
  maskable192: `${BRAND_ICON_BASE}/icon-maskable-192.png`,
  maskable512: `${BRAND_ICON_BASE}/icon-maskable-512.png`,
} as const

type AppleSplashScreen = {
  href: string
  media: string
}

/**
 * Portrait splash screens for iOS home-screen PWAs. Each image must match the
 * logical device size and pixel ratio in its media query exactly.
 */
export const IOS_SPLASH_SCREENS: AppleSplashScreen[] = [
  {
    href: '/splash/ios/splash-750x1334.png',
    media:
      'screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-828x1792.png',
    media:
      'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1125x2436.png',
    media:
      'screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1170x2532.png',
    media:
      'screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1179x2556.png',
    media:
      'screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1206x2622.png',
    media:
      'screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1242x2208.png',
    media:
      'screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1242x2688.png',
    media:
      'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1260x2736.png',
    media:
      'screen and (device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1284x2778.png',
    media:
      'screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1290x2796.png',
    media:
      'screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
  {
    href: '/splash/ios/splash-1320x2868.png',
    media:
      'screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
  },
]

export function createAppIconsMetadata(): NonNullable<Metadata['icons']> {
  return {
    icon: [
      { url: BRAND_ICONS.faviconSvg, type: 'image/svg+xml' },
      { url: BRAND_ICONS.favicon16, sizes: '16x16', type: 'image/png' },
      { url: BRAND_ICONS.favicon32, sizes: '32x32', type: 'image/png' },
      { url: BRAND_ICONS.favicon48, sizes: '48x48', type: 'image/png' },
    ],
    shortcut: BRAND_ICONS.faviconIco,
    apple: BRAND_ICONS.appleTouchIcon,
  }
}

export function createClientAppMetadata(): Metadata {
  return {
    title: APP_NAME,
    description: APP_TAGLINE,
    applicationName: APP_NAME,
    manifest: '/manifest.webmanifest',
    icons: createAppIconsMetadata(),
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: APP_SHORT_NAME,
      startupImage: IOS_SPLASH_SCREENS.map(({ href, media }) => ({
        url: href,
        media,
      })),
    },
    formatDetection: {
      telephone: false,
    },
    // Safari still expects this legacy tag for startup images on iOS PWAs.
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'mobile-web-app-capable': 'yes',
      'google-adsense-account': 'ca-pub-6301512886533217',
    },
  }
}

export function createClientAppViewport(): Viewport {
  return {
    themeColor: BRAND_THEME_COLOR,
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  }
}

export function createClientAppManifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_TAGLINE,
    start_url: '/sessions',
    scope: '/',
    display: 'standalone',
    background_color: BRAND_BACKGROUND_COLOR,
    theme_color: BRAND_THEME_COLOR,
    orientation: 'portrait',
    icons: [
      {
        src: BRAND_ICONS.icon192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: BRAND_ICONS.icon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: BRAND_ICONS.maskable192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: BRAND_ICONS.maskable512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
