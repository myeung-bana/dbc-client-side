'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  joinBySlugAction,
  redeemInviteAction,
  resolveInviteAction,
  resolveSlugJoinAction,
} from '@/app/actions/client'
import { InviteQrScannerView } from '@/components/invite-qr-scanner-view'
import {
  JoinScanManualLink,
  JoinScanResultCard,
} from '@/components/join-scan-result-card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  joinScanNextPath,
  parseJoinScan,
  type JoinScanResult,
} from '@/lib/invite/parse-join-scan'
import { toastError, toastSuccess, toastWarning } from '@/lib/toast/haptic-toast'
import type { ResolvedSlugJoin, ResolvedSpaceInvite } from '@/lib/types'

type InviteQrScannerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAuthenticated: boolean
}

export function InviteQrScannerSheet({
  open,
  onOpenChange,
  isAuthenticated,
}: InviteQrScannerSheetProps) {
  const router = useRouter()
  const [scanning, setScanning] = useState(true)
  const [scanResult, setScanResult] = useState<JoinScanResult | null>(null)
  const [oneOffInvite, setOneOffInvite] = useState<ResolvedSpaceInvite | null>(null)
  const [slugJoin, setSlugJoin] = useState<ResolvedSlugJoin | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resolvePending, startResolve] = useTransition()
  const [joinPending, startJoin] = useTransition()

  const reset = useCallback(() => {
    setScanning(true)
    setScanResult(null)
    setOneOffInvite(null)
    setSlugJoin(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const loginNextPath = scanResult ? joinScanNextPath(scanResult) : '/join'

  const handleScan = useCallback((raw: string) => {
    const parsed = parseJoinScan(raw)
    if (!parsed) {
      toastWarning('Unrecognized QR code')
      return
    }

    setScanning(false)
    setScanResult(parsed)
    setOneOffInvite(null)
    setSlugJoin(null)
    setError(null)

    startResolve(async () => {
      if (parsed.type === 'one_off_code') {
        const result = await resolveInviteAction(parsed.code)
        if (!result.ok) {
          setError(result.error)
          return
        }
        setOneOffInvite(result.data.invite)
        toastSuccess('Invite code scanned')
        return
      }

      const result = await resolveSlugJoinAction(parsed.slug, parsed.intent)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSlugJoin(result.data)
      toastSuccess('Join link scanned')
    })
  }, [])

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
      <SheetContent side="bottom" className="max-h-[90dvh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Scan invite QR</SheetTitle>
          <SheetDescription>
            Point your camera at a join QR code from your organiser.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <InviteQrScannerView
            scanning={scanning && !resolvePending}
            onScan={handleScan}
            onScanError={() => {
              setScanning(false)
              toastWarning('Camera access is unavailable. Enter the code manually.')
            }}
            onResume={() => setScanning(true)}
          />

          {resolvePending ? (
            <p className="text-sm text-muted-foreground">Checking invite…</p>
          ) : null}

          <JoinScanResultCard
            isAuthenticated={isAuthenticated}
            loginNextPath={loginNextPath}
            pending={joinPending}
            onJoin={onJoin}
            oneOffInvite={oneOffInvite}
            slugJoin={slugJoin}
            error={error}
          />

          <p className="text-center text-sm text-muted-foreground">
            <JoinScanManualLink />
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
