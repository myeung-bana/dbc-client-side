import { hapticTrigger } from 'ios-haptics'

const HOST_ATTRIBUTE = 'data-ios-haptic-host'

const noop = () => {}

/**
 * Covers `host` with a transparent native switch so a direct iOS tap produces a
 * haptic tick. The click bubbles from the switch to the host, so React handlers
 * (including Next.js `Link` navigation) still run.
 *
 * iOS 26.5+ only fires one tick per tap, so multi-segment patterns collapse to a
 * single tick there.
 */
export function attachHapticOverlay(host: HTMLElement): () => void {
  if (host.hasAttribute(HOST_ATTRIBUTE)) return noop

  const previousPosition = host.style.position
  hapticTrigger(host)

  const overlay = host.lastElementChild
  if (!(overlay instanceof HTMLInputElement)) {
    host.style.position = previousPosition
    return noop
  }

  host.setAttribute(HOST_ATTRIBUTE, '')
  overlay.tabIndex = -1
  overlay.setAttribute('aria-hidden', 'true')

  return () => {
    overlay.remove()
    host.removeAttribute(HOST_ATTRIBUTE)
    host.style.position = previousPosition
  }
}
