'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  getCheckinContextAction,
  joinBySlugAction,
  redeemInviteAction,
  resolveInviteAction,
  resolveSlugJoinAction,
  submitCheckinScanAction,
} from '@/app/actions/client'
import { CheckinScanner } from '@/components/checkin/checkin-scanner'
import { InviteQrScannerView } from '@/components/invite-qr-scanner-view'
import {
  JoinScanManualLink,
  JoinScanResultCard,
} from '@/components/join-scan-result-card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { joinScanNextPath, type JoinScanResult } from '@/lib/invite/parse-join-scan'
import { parseUniversalScan } from '@/lib/invite/parse-universal-scan'
import { toastError, toastSuccess, toastWarning } from '@/lib/toast/haptic-toast'
import type { ResolvedSlugJoin, ResolvedSpaceInvite } from '@/lib/types'

type SessionOption = {
  id: string
  title: string
  startsAt: string
}

type InviteQrScannerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAuthenticated: boolean
  canScanCheckin?: boolean
}

export function InviteQrScannerSheet({
  open,
  onOpenChange,
  isAuthenticated,
  canScanCheckin = false,
}: InviteQrScannerSheetProps) {
  const router = useRouter()
  const [scanning, setScanning] = useState(true)
  const [scanResult, setScanResult] = useState<JoinScanResult | null>(null)
  const [oneOffInvite, setOneOffInvite] = useState<ResolvedSpaceInvite | null>(null)
  const [slugJoin, setSlugJoin] = useState<ResolvedSlugJoin | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkinToken, setCheckinToken] = useState<string | null>(null)
  const [checkinDenied, setCheckinDenied] = useState(false)
  const [sessions, setSessions] = useState<SessionOption[]>([])
  const [sessionId, setSessionId] = useState('')
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null)
  const [resolvePending, startResolve] = useTransition()
  const [joinPending, startJoin] = useTransition()

  const reset = useCallback(() => {
    setScanning(true)
    setScanResult(null)
    setOneOffInvite(null)
    setSlugJoin(null)
    setError(null)
    setCheckinToken(null)
    setCheckinDenied(false)
    setSessions([])
    setSessionId('')
    setCheckinMessage(null)
  }, [])

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const loginNextPath = scanResult ? joinScanNextPath(scanResult) : '/join'
  const showingResult = Boolean(scanResult || checkinToken || checkinDenied || checkinMessage)

  const handleScan = useCallback(
    (raw: string) => {
      const parsed = parseUniversalScan(raw)
      if (!parsed) {
        toastWarning('Unrecognized QR code')
        return
      }

      setScanning(false)
      setScanResult(null)
      setOneOffInvite(null)
      setSlugJoin(null)
      setError(null)
      setCheckinToken(null)
      setCheckinDenied(false)
      setCheckinMessage(null)

      if (parsed.kind === 'checkin') {
        if (!canScanCheckin) {
          setCheckinDenied(true)
          toastWarning('Show this code to an organiser to check in')
          return
        }

        setCheckinToken(parsed.token)
        startResolve(async () => {
          const result = await getCheckinContextAction()
          if (!result.ok) {
            setError(result.error)
            return
          }
          setSessions(result.data.sessions)
          setSessionId(result.data.sessions[0]?.id ?? '')
        })
        return
      }

      const join = parsed.join
      setScanResult(join)
      startResolve(async () => {
        if (join.type === 'one_off_code') {
          const result = await resolveInviteAction(join.code)
          if (!result.ok) {
            setError(result.error)
            return
          }
          setOneOffInvite(result.data.invite)
          toastSuccess('Invite code scanned')
          return
        }

        const result = await resolveSlugJoinAction(join.slug, join.intent)
        if (!result.ok) {
          setError(result.error)
          return
        }
        setSlugJoin(result.data)
        toastSuccess('Join link scanned')
      })
    },
    [canScanCheckin],
  )

  function onJoin() {
    if (!scanResult) return

    startJoin(async () => {
      if (scanResult.type === 'one_off_code') {
        const result = await redeemInviteAction(scanResult.code)
        if (!result.ok) {
          toastError(result.error)
          return
        }
        toastSuccess(
          result.data.alreadyMember ? 'You are already in this space' : 'Joined space successfully',
        )
      } else {
        const result = await joinBySlugAction(scanResult.slug, scanResult.intent)
        if (!result.ok) {
          toastError(result.error)
          return
        }
        toastSuccess('Joined space successfully')
      }

      onOpenChange(false)
      router.push(
        scanResult.type === 'standing_slug'
          ? `/sessions?space=${encodeURIComponent(scanResult.slug)}`
          : '/sessions',
      )
      router.refresh()
    })
  }

  function confirmCheckin() {
    if (!checkinToken) return

    startJoin(async () => {
      const result = await submitCheckinScanAction(checkinToken, sessionId || undefined)
      if (!result.ok) {
        toastError(result.error)
        setError(result.error)
        return
      }
      const text = `${result.data.playerName} checked in · ${result.data.creditsRemaining} credits left`
      setCheckinMessage(text)
      setCheckinToken(null)
      toastSuccess(text)
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Scan</SheetTitle>
          <SheetDescription>
            {canScanCheckin
              ? 'Point your camera at a join code or a player check-in QR.'
              : 'Point your camera at a join QR code from your organiser.'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <InviteQrScannerView
            scanning={scanning && !resolvePending && !joinPending}
            onScan={handleScan}
            onScanError={() => {
              setScanning(false)
              toastWarning('Camera access is unavailable. Enter the code manually.')
            }}
            onResume={() => setScanning(true)}
          />

          {resolvePending ? <p className="text-sm text-muted-foreground">Checking code…</p> : null}

          {checkinDenied ? (
            <div className="space-y-3 rounded-lg border p-4 text-sm">
              <p>This is a check-in code. Show it to your organiser, or open My Games to display your own QR.</p>
              <Button size="sm" variant="outline" render={<Link href="/my-games" />}>
                My Games
              </Button>
            </div>
          ) : null}

          {checkinToken ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="scan-checkin-session">Session</Label>
                <select
                  id="scan-checkin-session"
                  className="flex h-10 w-full rounded-md border bg-transparent px-3 text-sm"
                  value={sessionId}
                  onChange={(event) => setSessionId(event.target.value)}
                >
                  {sessions.length === 0 ? <option value="">No upcoming sessions</option> : null}
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title} · {new Date(session.startsAt).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" disabled={joinPending} onClick={confirmCheckin}>
                {joinPending ? 'Checking in…' : 'Check in'}
              </Button>
            </div>
          ) : null}

          {checkinMessage ? <p className="text-sm text-muted-foreground">{checkinMessage}</p> : null}

          {showingResult ? (
            <Button variant="outline" className="w-full" onClick={reset}>
              Scan again
            </Button>
          ) : null}

          <JoinScanResultCard
            isAuthenticated={isAuthenticated}
            loginNextPath={loginNextPath}
            pending={joinPending}
            onJoin={onJoin}
            oneOffInvite={oneOffInvite}
            slugJoin={slugJoin}
            error={scanResult ? error : null}
          />

          {canScanCheckin && scanning && !showingResult ? <CheckinScanner showScanner={false} /> : null}

          <p className="text-center text-sm text-muted-foreground">
            <JoinScanManualLink />
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
