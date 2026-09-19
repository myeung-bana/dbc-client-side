import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarDisplaySrc } from '@/lib/profile/avatar-url'
import { cn } from '@/lib/utils'

type SpaceLogoProps = {
  name: string
  logoUrl?: string | null
  cacheRevision?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 text-sm',
  md: 'size-10 text-base',
  lg: 'size-14 text-2xl',
} as const

export function SpaceLogo({
  name,
  logoUrl,
  cacheRevision = 0,
  size = 'md',
  className,
}: SpaceLogoProps) {
  const initials = name.trim().slice(0, 1).toUpperCase() || '?'
  const imageSrc = getAvatarDisplaySrc(logoUrl, cacheRevision)

  return (
    <Avatar className={cn('rounded-full', sizeClasses[size], className)}>
      {imageSrc ? <AvatarImage key={imageSrc} src={imageSrc} alt="" /> : null}
      <AvatarFallback className="rounded-full">{initials}</AvatarFallback>
    </Avatar>
  )
}
