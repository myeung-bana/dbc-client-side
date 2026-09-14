export type CapacityTone = 'available' | 'filling' | 'almost-full' | 'full'

export function getCapacityFillPercent(confirmed: number, capacity: number): number {
  if (capacity <= 0) return 0
  return Math.min(100, Math.round((confirmed / capacity) * 100))
}

export function getCapacityTone(confirmed: number, capacity: number): CapacityTone {
  if (capacity <= 0 || confirmed >= capacity) return 'full'
  const percent = getCapacityFillPercent(confirmed, capacity)
  if (percent >= 90) return 'almost-full'
  if (percent >= 70) return 'filling'
  return 'available'
}

export function getCapacityBarClass(tone: CapacityTone): string {
  switch (tone) {
    case 'full':
      return 'bg-destructive'
    case 'almost-full':
      return 'bg-amber-500'
    case 'filling':
      return 'bg-primary/80'
    default:
      return 'bg-primary'
  }
}

export function formatCapacityLabel(confirmed: number, capacity: number): string {
  return `${confirmed} / ${capacity} going`
}
