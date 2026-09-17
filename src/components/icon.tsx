import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  ChevronRight,
  Search,
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
  camera: Camera,
  check: Check,
  user: User,
  search: Search,
  grid: Grid,
  download: Download,
  x: X,
  info: Info,
  'chevron-right': ChevronRight,
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
