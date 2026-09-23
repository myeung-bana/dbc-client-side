'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  joinBySlugAction,
  redeemInviteAction,
  resolveInviteAction,
  resolveSlugJoinAction,
  submitCheckinScanAction,
} from '@/app/actions/client'
import { InviteQrScannerView } from '@/components/invite-qr-scanner-view'
import {
  JoinScanManualLink,
  JoinScanResultCard,
} from '@/components/join-scan-result-card'
import { Button } from '@/components/ui/button'
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
  const [checkinDenied, setCheckinDenied] = useState(false)
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null)
  const [resolvePending, startResolve] = useTransition()
  const [joinPending, startJoin] = useTransition()

  const reset = useCallback(() => {
    setScanning(true)
    setScanResult(null)
    setOneOffInvite(null)
    setSlugJoin(null)
    setError(null)
    setCheckinDenied(false)
    setCheckinMessage(null)
  }, [])

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const loginNextPath = scanResult ? joinScanNextPath(scanResult) : '/join'
  const showingResult = Boolean(scanResult || checkinDenied || checkinMessage || error)

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
      setCheckinDenied(false)
      setCheckinMessage(null)

      if (parsed.kind === 'checkin') {
        if (!canScanCheckin) {
          setCheckinDenied(true)
          toastWarning('Show this code to an organiser to check in')
          return
        }

        startResolve(async () => {
          const result = await submitCheckinScanAction(parsed.token)
          if (!result.ok) {
            setError(result.error)
            toastError(result.error)
            return
          }
          const text = `${result.data.playerName} checked in · ${result.data.creditsRemaining} credits left`
          setCheckinMessage(text)
          toastSuccess(text)
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
              <p>This is a check-in code. Show it from the session page so an organiser can scan it.</p>
            </div>
          ) : null}

          {checkinMessage ? <p className="text-sm text-muted-foreground">{checkinMessage}</p> : null}
          {!scanResult && error ? <p className="text-sm text-destructive">{error}</p> : null}

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

          <p className="text-center text-sm text-muted-foreground">
            <JoinScanManualLink />
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
