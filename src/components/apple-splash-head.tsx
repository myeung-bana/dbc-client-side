import { IOS_SPLASH_SCREENS } from '@/lib/pwa-metadata'

/**
 * Explicit startup-image links are more reliable on iOS than metadata alone,
 * especially on Next.js 15+ where the legacy apple-mobile-web-app-capable tag
 * must also be present.
 */
export function AppleSplashHead() {
  return (
    <>
      {IOS_SPLASH_SCREENS.map(({ href, media }) => (
        <link
          key={href}
          rel="apple-touch-startup-image"
          href={href}
          media={media}
        />
      ))}
    </>
  )
}
