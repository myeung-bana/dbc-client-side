import { toast as sonnerToast, type ExternalToast } from 'sonner'
import { triggerHaptic } from '@/lib/haptics/haptics'

export function toastSuccess(message: string, data?: ExternalToast) {
  triggerHaptic('success')
  return sonnerToast.success(message, data)
}

export function toastError(message: string, data?: ExternalToast) {
  triggerHaptic('error')
  return sonnerToast.error(message, data)
}

export function toastWarning(message: string, data?: ExternalToast) {
  triggerHaptic('warning')
  return sonnerToast.warning(message, data)
}

export { sonnerToast as toast }
