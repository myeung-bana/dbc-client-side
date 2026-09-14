'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Loader,
  XCircle,
} from 'react-feather'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      icons={{
        success: <CheckCircle size={16} />,
        info: <Info size={16} />,
        warning: <AlertTriangle size={16} />,
        error: <XCircle size={16} />,
        loading: <Loader size={16} className="animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
