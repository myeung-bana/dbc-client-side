'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toastError, toastSuccess, toastWarning } from '@/lib/toast/haptic-toast'
import { redeemInviteAction, resolveInviteAction } from '@/app/actions/client'
import { InviteQrScannerView } from '@/components/invite-qr-scanner-view'
import { JoinScanResultCard } from '@/components/join-scan-result-card'
import { OpenLoginButton } from '@/components/open-login-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { parseInviteCode } from '@/lib/invite/parse-code'
import { joinScanNextPath, parseJoinScan } from '@/lib/invite/parse-join-scan'
import type { ResolvedSpaceInvite } from '@/lib/types'

type JoinPageContentProps = {
  isAuthenticated: boolean
  initialCode?: string
}

export function JoinPageContent({ isAuthenticated, initialCode }: JoinPageContentProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'scan' | 'enter'>(initialCode ? 'enter' : 'scan')
  const [code, setCode] = useState(initialCode ?? '')
  const [resolved, setResolved] = useState<ResolvedSpaceInvite | null>(null)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(true)
  const [resolvePending, startResolve] = useTransition()
  const [redeemPending, startRedeem] = useTransition()

  const loginNextPath = code.trim()
    ? `/join?code=${encodeURIComponent(parseInviteCode(code))}`
    : '/join'

  const resolveCode = useCallback((rawCode: string) => {
    const normalized = parseInviteCode(rawCode)
    if (!normalized) {
      setResolved(null)
      setResolveError('Enter a valid invite code')
      return
    }

    setCode(normalized)
    setResolveError(null)

    startResolve(async () => {
      const result = await resolveInviteAction(normalized)
      if (!result.ok) {
        setResolved(null)
        setResolveError(result.error)
        return
      }
      setResolved(result.data.invite)
    })
  }, [])

  useEffect(() => {
    if (initialCode) {
      resolveCode(initialCode)
    }
  }, [initialCode, resolveCode])

  function onScanDetected(value: string) {
    const parsed = parseJoinScan(value)
    if (!parsed) {
      toastWarning('Unrecognized QR code')
      return
    }

    if (parsed.type === 'standing_slug') {
      setScanning(false)
      router.push(joinScanNextPath(parsed))
      return
    }

    setScanning(false)
    setMode('enter')
    resolveCode(parsed.code)
    toastSuccess('Invite code scanned')
  }

  function onRedeem() {
    const normalized = parseInviteCode(code)
    if (!normalized) {
      toastWarning('Enter a valid invite code')
      return
    }

    startRedeem(async () => {
      const result = await redeemInviteAction(normalized)
      if (!result.ok) {
        toastError(result.error)
        return
      }

      toastSuccess(
        result.data.alreadyMember ? 'You are already in this space' : 'Joined space successfully',
      )
      router.push('/sessions')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={mode}
        onValueChange={(value) => setMode(value as 'scan' | 'enter')}
      >
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="scan" className="flex-1">
            Scan QR
          </TabsTrigger>
          <TabsTrigger value="enter" className="flex-1">
            Enter code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-4 space-y-4">
          <InviteQrScannerView
            scanning={scanning}
            onScan={onScanDetected}
            onScanError={() => {
              setScanning(false)
              toastWarning('Camera access is unavailable. Enter the code manually.')
              setMode('enter')
            }}
            onResume={() => setScanning(true)}
          />
          <p className="text-sm text-muted-foreground">
            Point your camera at the QR code from your organiser. If camera access is blocked, use
            Enter code instead.
          </p>
        </TabsContent>

        <TabsContent value="enter" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite code</Label>
            <Input
              id="inviteCode"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="GACHI-XXXXXX"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={resolvePending || !code.trim()}
            onClick={() => resolveCode(code)}
          >
            {resolvePending ? 'Checking…' : 'Check code'}
          </Button>
        </TabsContent>
      </Tabs>

      <JoinScanResultCard
        isAuthenticated={isAuthenticated}
        loginNextPath={loginNextPath}
        pending={redeemPending}
        onJoin={onRedeem}
        oneOffInvite={resolved}
        error={resolveError}
      />
    </div>
  )
}
