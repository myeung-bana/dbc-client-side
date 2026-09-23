import Link from 'next/link'
import { Icon } from '@/components/icon'
import { Button } from '@/components/ui/button'

type PassesEmptyVariant = 'casual' | 'member' | 'join'

const COPY: Record<PassesEmptyVariant, { title: string; description: string }> = {
  casual: {
    title: 'No pass credits yet',
    description: 'Ask your organiser for a season pass. Credits show up here once they are assigned.',
  },
  member: {
    title: 'No season pass needed',
    description: 'You book as a member. Pass credits are only required for casual bookings.',
  },
  join: {
    title: 'No passes yet',
    description: 'Join a space as casual, then ask your organiser to assign a season pass.',
  },
}

export function PassesEmptyState({ variant }: { variant: PassesEmptyVariant }) {
  const copy = COPY[variant]

  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icon name="check-circle" size={28} className="text-muted-foreground" />
      </div>
      <p className="mt-4 font-medium">{copy.title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{copy.description}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {variant === 'member' ? (
          <Button size="sm" render={<Link href="/sessions" />}>
            Browse sessions
          </Button>
        ) : (
          <>
            <Button size="sm" render={<Link href="/join" />}>
              Join a space
            </Button>
            <Button size="sm" variant="outline" render={<Link href="/spaces" />}>
              My spaces
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
