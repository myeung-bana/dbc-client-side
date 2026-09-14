import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Download,
  Grid,
  Info,
  Loader,
  User,
  X,
  type IconProps as FeatherIconProps,
} from 'react-feather'
import { cn } from 'cn'

const ICONS = {
  calendar: Calendar,
  user: User,
  grid: Grid,
  download: Download,
  x: X,
  info: Info,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  loader: Loader,
} as const

export type IconName = keyof typeof ICONS

type IconProps = {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: FeatherIconProps['strokeWidth']
}

export function Icon({ name, size = 20, className, strokeWidth = 2 }: IconProps) {
  const Component = ICONS[name]
  return <Component size={size} strokeWidth={strokeWidth} className={cn('shrink-0', className)} />
}
