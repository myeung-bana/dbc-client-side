'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export type SessionDateOption = {
  key: string
  weekday: string
  day: string
  hasSessions: boolean
  href: string
}

type SessionDateStripProps = {
  days: SessionDateOption[]
  selectedKey: string
}

export function SessionDateStrip({ days, selectedKey }: SessionDateStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    const selected = scroller?.querySelector<HTMLElement>('[aria-current="date"]')
    if (!scroller || !selected) return
    const left = selected.offsetLeft - scroller.clientWidth / 2 + selected.clientWidth / 2
    scroller.scrollTo({ left: Math.max(0, left) })
  }, [selectedKey])

  return (
    <div className="-mx-4 min-w-0">
      <div
        ref={scrollerRef}
        className="flex touch-pan-x snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day) => {
          const selected = day.key === selectedKey
          return (
            <Link
              key={day.key}
              href={day.href}
              aria-current={selected ? 'date' : undefined}
              aria-label={`${day.weekday} ${day.day}`}
              className={cn(
                'flex w-14 shrink-0 snap-center flex-col items-center justify-center rounded-xl border px-0.5 py-1.5 text-center',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground',
              )}
            >
              <span
                className={cn(
                  'text-[11px] leading-none',
                  selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                )}
              >
                {day.weekday}
              </span>
              <span className="mt-1 text-sm font-semibold leading-none">{day.day}</span>
              <span
                className={cn(
                  'mt-1 size-1 rounded-full',
                  day.hasSessions
                    ? selected
                      ? 'bg-primary-foreground'
                      : 'bg-primary'
                    : 'bg-transparent',
                )}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
