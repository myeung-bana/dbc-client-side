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
  Settings,
  User,
  X,
  Activity,
  type IconProps as FeatherIconProps,
} from 'react-feather'
import { cn } from 'cn'

function QrIcon({ size = 24, className, strokeWidth = 2 }: FeatherIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M14 14h.01" />
      <path d="M18 14h.01" />
      <path d="M14 18h.01" />
      <path d="M18 18h.01" />
      <path d="M21 14v4h-4" />
    </svg>
  )
}

const ICONS = {
  calendar: Calendar,
  camera: Camera,
  check: Check,
  user: User,
  search: Search,
  settings: Settings,
  grid: Grid,
  activity: Activity,
  download: Download,
  x: X,
  info: Info,
  qr: QrIcon,
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
