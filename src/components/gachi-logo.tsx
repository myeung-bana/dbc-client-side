import { cn } from '@/lib/utils'

export const GACHI_LOGO = {
  markOnDark: '/brand/gachi-mark-on-dark.svg',
  markOnLight: '/brand/gachi-mark-on-light.svg',
  wordmarkOnLight: '/brand/gachi-wordmark-on-light.svg',
} as const

export type GachiLogoSurface = 'light' | 'dark'
export type GachiLogoVariant = 'mark' | 'wordmark'

export function getGachiLogoSrc(
  surface: GachiLogoSurface,
  variant: GachiLogoVariant = 'mark',
) {
  if (surface === 'dark') return GACHI_LOGO.markOnDark
  return variant === 'wordmark' ? GACHI_LOGO.wordmarkOnLight : GACHI_LOGO.markOnLight
}

export function getGachiLogoBlendClass(surface: GachiLogoSurface, variant: GachiLogoVariant) {
  if (surface === 'light' && variant === 'mark') {
    return 'mix-blend-screen'
  }
  return undefined
}

type GachiLogoProps = {
  surface?: GachiLogoSurface
  variant?: GachiLogoVariant
  className?: string
  height?: number
  priority?: boolean
}

export function GachiLogo({
  surface = 'light',
  variant,
  className,
  height = 28,
}: GachiLogoProps) {
  const resolvedVariant = variant ?? (surface === 'dark' ? 'mark' : 'wordmark')
  const src = getGachiLogoSrc(surface, resolvedVariant)
  const blendClass = getGachiLogoBlendClass(surface, resolvedVariant)

  return (
    <img
      src={src}
      alt="Gachi"
      width={Math.round(height * 3.89)}
      height={height}
      className={cn('h-auto w-auto shrink-0', blendClass, className)}
      style={{ height }}
    />
  )
}
